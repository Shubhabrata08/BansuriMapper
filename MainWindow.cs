using Microsoft.UI;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Automation.Peers;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Documents;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using Windows.UI;

namespace BansuriMapper;

public sealed class MainWindow : Window
{
    private static readonly Color Ink = ThemeColor("BansuriInkColor");
    private static readonly Color Muted = ThemeColor("BansuriMutedColor");
    private static readonly Color Gold = ThemeColor("BansuriGoldColor");
    private static readonly Color Mint = ThemeColor("BansuriMintColor");
    private static readonly Color Line = ThemeColor("BansuriOutlineColor");
    private static readonly Color Background = ThemeColor("BansuriBackgroundColor");
    private readonly MapperState state = new();
    private readonly ComboBox thaat = new(), reference = new(), flute = new();
    private readonly ToggleButton sharps = new(), flats = new();
    private readonly ToggleSwitch alternate = new() { OnContent = null, OffContent = null, MinWidth = 0 };
    private readonly Grid alternateRow = new() { ColumnSpacing = 12 };
    private readonly Grid settings = new(), workspace = new(), information = new();
    private readonly StackPanel shell = new() { Spacing = 24, MaxWidth = 1120, HorizontalAlignment = HorizontalAlignment.Stretch };
    private readonly ListView rows = new() { SelectionMode = ListViewSelectionMode.Single, IsItemClickEnabled = false };
    private readonly Grid holes = new() { ColumnSpacing = 6 };
    private readonly TextBlock summary = Text("", 28, Gold, true), pills = Text("", 12, Muted);
    private readonly TextBlock headingTitle = Text("Bansuri Fingering Mapper", 40, Ink, true);
    private readonly TextBlock sequence = Text("", 17, Ink, true);
    private readonly TextBlock selected = Text("", 48, Gold, true), pitch = Text("", 26);
    private readonly TextBlock frequency = Text("", 11, Muted), relative = Text("", 11, Gold);
    private readonly TextBlock techniqueTitle = Text("", 12, Gold), techniqueText = Text("", 12, Muted), code = Text("", 16);
    private readonly List<Grid> rowGrids = [];
    private readonly ScrollViewer scroll;
    private readonly TranslateTransform detailOffset = new();
    private bool updating;
    private bool compact;

    public MainWindow()
    {
        Title = "Bansuri Fingering Mapper";
        AppWindow.Resize(new Windows.Graphics.SizeInt32(1280, 1000));
        AppWindow.TitleBar.BackgroundColor = Background;
        AppWindow.TitleBar.ForegroundColor = Ink;
        AppWindow.TitleBar.ButtonBackgroundColor = Background;
        AppWindow.TitleBar.ButtonForegroundColor = Ink;
        AppWindow.TitleBar.InactiveBackgroundColor = Background;
        AppWindow.TitleBar.InactiveForegroundColor = Muted;
        AppWindow.TitleBar.ButtonInactiveBackgroundColor = Background;
        AppWindow.TitleBar.ButtonInactiveForegroundColor = Muted;
        AppWindow.TitleBar.ButtonHoverBackgroundColor = ThemeColor("BansuriSurfaceVariantColor");
        AppWindow.TitleBar.ButtonHoverForegroundColor = Ink;
        if (AppWindow.Presenter is OverlappedPresenter presenter)
        {
            presenter.PreferredMinimumWidth = 390;
            presenter.PreferredMinimumHeight = 520;
        }

        scroll = new ScrollViewer
        {
            Content = shell,
            Padding = new Thickness(24, 30, 24, 36),
            HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled,
            VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
            Background = Brush(Background),
            RequestedTheme = ElementTheme.Dark
        };
        Content = scroll;
        Identify(scroll, "PageScroll", "Bansuri mapper page");
        var heading = new StackPanel { Spacing = 10 };
        var brand = Text("HINDUSTANI FLUTE TOOLKIT", 12, Gold, true);
        brand.CharacterSpacing = 90;
        heading.Children.Add(brand);
        AutomationProperties.SetHeadingLevel(headingTitle, AutomationHeadingLevel.Level1);
        heading.Children.Add(headingTitle);
        heading.Children.Add(Text("Choose a thaat, set the bansuri that defines your reference Sa, then choose the flute you are mapping. The Hindustani swaras stay relative to Sa (Sa, Re, Ga\u2026), while the app independently calculates the hole combinations needed on the flute in your hands.", 14, Muted));
        shell.Children.Add(heading);
        BuildSettings();
        var settingsContent = new StackPanel { Spacing = 20 };
        var settingsHeading = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 12 };
        settingsHeading.Children.Add(new FontIcon { Glyph = "\uE713", FontSize = 20, Foreground = Brush(Gold) });
        settingsHeading.Children.Add(Text("Scale & instruments", 20, Ink, true));
        settingsContent.Children.Add(settingsHeading);
        settingsContent.Children.Add(settings);
        shell.Children.Add(Panel(settingsContent));
        var summaryGroup = new StackPanel { Spacing = 10 };
        summaryGroup.Children.Add(summary);
        summaryGroup.Children.Add(pills);
        Identify(summary, "Summary");
        AutomationProperties.SetLiveSetting(summary, AutomationLiveSetting.Polite);
        shell.Children.Add(summaryGroup);
        Identify(sequence, "Sequence");
        shell.Children.Add(Panel(sequence, 14));
        workspace.ColumnSpacing = 18;
        workspace.RowSpacing = 18;
        workspace.Children.Add(BuildDetail());
        workspace.Children.Add(BuildMap());
        ((FrameworkElement)workspace.Children[0]).RenderTransform = detailOffset;
        ((FrameworkElement)workspace.Children[0]).SizeChanged += (_, _) => UpdateStickyDetail();
        workspace.SizeChanged += (_, _) => UpdateStickyDetail();
        scroll.ViewChanged += (_, _) => UpdateStickyDetail();
        shell.Children.Add(workspace);
        information.ColumnSpacing = 14;
        information.RowSpacing = 14;
        information.Children.Add(Info("REFERENCE SA VS. MAPPED FLUTE", "The reference bansuri defines the real-world pitch of Sa. For example, choosing an E reference bansuri means H1\u2013H3 closed is called Sa and sounds E. If the flute being mapped is C, the app finds the C-flute fingering that reproduces that same E pitch, while keeping the swara label as Sa."));
        information.Children.Add(Info("PRACTICAL TUNING NOTE", "Six-hole fingering charts are reference patterns. Half-hole size, cross-fingerings, breath pressure and octave response vary between bamboo flutes and teachers. Tune each note against your chosen Sa drone; use the diagram as a starting point."));
        shell.Children.Add(information);
        shell.Children.Add(new Border { Height = 1, Background = Brush(Line) });
        shell.Children.Add(Text("Six-hole reference: Sa on H1\u2013H3 \u00b7 Hole 1 is nearest the blowing end. Swaras are relative to the selected reference bansuri.", 11, Muted));
        var links = new StackPanel { Spacing = 2 };
        links.Children.Add(new HyperlinkButton { Content = "Six-hole bansuri swara chart", NavigateUri = new Uri("https://bikashacharya.com/sangeet-yatra/basuri/swaras.html"), Foreground = Brush(Gold) });
        links.Children.Add(new HyperlinkButton { Content = "Interactive fingering chart", NavigateUri = new Uri("https://www.anubodh.com/fingering-charts.php"), Foreground = Brush(Gold) });
        shell.Children.Add(links);
        shell.SizeChanged += (_, args) => Layout(args.NewSize.Width);
        Render();
        Layout(1120);
    }

    private void BuildSettings()
    {
        settings.ColumnSpacing = 20;
        settings.RowSpacing = 20;
        foreach (var name in Mapper.Thaats.Keys) thaat.Items.Add(name);
        for (var i = 0; i < 12; i++)
        {
            reference.Items.Add(new ComboBoxItem());
            flute.Items.Add(new ComboBoxItem());
        }
        settings.Children.Add(Field("Thaat", thaat, "Select one of the ten commonly taught Hindustani thaats.", "ThaatSelect"));
        settings.Children.Add(Field("Reference bansuri \u00b7 Sa", reference, "Holes 1\u20133 closed are always called Sa. This setting defines Sa\u2019s actual pitch.", "ReferenceSelect"));
        settings.Children.Add(Field("Flute being mapped", flute, "Choose the instrument you will play. The app calculates its hole pattern for each reference swara.", "FluteSelect"));
        var modes = new Grid { ColumnSpacing = 4 };
        modes.ColumnDefinitions.Add(new ColumnDefinition());
        modes.ColumnDefinitions.Add(new ColumnDefinition());
        sharps.Content = "Sharps (#)";
        flats.Content = "Flats (\u266d)";
        foreach (var button in new[] { sharps, flats })
        {
            button.MinHeight = 40;
            button.HorizontalAlignment = HorizontalAlignment.Stretch;
            button.Padding = new Thickness(6);
            modes.Children.Add(button);
        }
        Grid.SetColumn(flats, 1);
        Identify(sharps, "SharpMode", "Sharps (#)");
        Identify(flats, "FlatMode", "Flats (\u266d)");
        settings.Children.Add(Field("Western note spelling", modes, "Choose one accidental style for all Western pitch names and flute keys.", "Notation"));
        var resetContent = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };
        resetContent.Children.Add(new FontIcon { Glyph = "\uE72C", FontSize = 16 });
        resetContent.Children.Add(Text("Reset to C \u00b7 Bhairav", 14));
        var reset = new Button { Content = resetContent, MinHeight = 40, HorizontalAlignment = HorizontalAlignment.Right };
        Identify(reset, "Reset", "Reset to C Bhairav");
        settings.Children.Add(reset);
        thaat.SelectionChanged += (_, _) => { if (!updating && thaat.SelectedItem is string name) { state.SetThaat(name); Render(); } };
        reference.SelectionChanged += (_, _) => { if (!updating && reference.SelectedIndex >= 0) { state.SetReference(reference.SelectedIndex); Render(); } };
        flute.SelectionChanged += (_, _) => { if (!updating && flute.SelectedIndex >= 0) { state.SetFlute(flute.SelectedIndex); Render(); } };
        sharps.Checked += (_, _) => SetNotation(false);
        sharps.Unchecked += (_, _) => SetNotation(false);
        flats.Checked += (_, _) => SetNotation(true);
        flats.Unchecked += (_, _) => SetNotation(true);
        reset.Click += (_, _) => { state.Reset(); Render(); };
    }

    private Border BuildDetail()
    {
        var content = new StackPanel { Spacing = 16 };
        content.Children.Add(Text("SELECTED SWARA", 12, Muted, true));
        var head = new Grid { ColumnSpacing = 12 };
        head.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        head.ColumnDefinitions.Add(new ColumnDefinition());
        head.Children.Add(selected);
        var pitchGroup = new StackPanel { Spacing = 4, HorizontalAlignment = HorizontalAlignment.Right };
        foreach (var label in new[] { pitch, frequency, relative }) { label.TextAlignment = TextAlignment.Right; pitchGroup.Children.Add(label); }
        head.Children.Add(pitchGroup);
        Grid.SetColumn(pitchGroup, 1);
        Identify(selected, "SelectedSwar"); Identify(pitch, "SelectedPitch"); Identify(frequency, "SelectedFrequency"); Identify(relative, "SelectedRelative");
        content.Children.Add(head);
        content.Children.Add(new Border { Height = 1, Background = Brush(Line) });
        content.Children.Add(Text("Required hole positions\nBlowing end \u2192 lower end", 12, Muted));
        for (var i = 0; i < 6; i++) holes.ColumnDefinitions.Add(new ColumnDefinition());
        var diagram = Panel(holes, 12);
        diagram.Background = Brush(ThemeColor("BansuriSurfaceVariantColor"));
        content.Children.Add(diagram);
        var legend = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 14 };
        foreach (var (stateChar, label) in new[] { ('X', "Closed"), ('H', "Half-covered"), ('O', "Open") })
        {
            var item = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 5 };
            item.Children.Add(Hole(stateChar, 10)); item.Children.Add(Text(label, 10, Muted)); legend.Children.Add(item);
        }
        content.Children.Add(legend);
        var technique = new StackPanel { Spacing = 7 };
        technique.Children.Add(techniqueTitle); technique.Children.Add(techniqueText);
        Identify(techniqueTitle, "TechniqueTitle"); Identify(techniqueText, "TechniqueText");
        var techniquePanel = Panel(technique, 14);
        techniquePanel.Background = Brush(ColorHelper.FromArgb(255, 48, 49, 36));
        techniquePanel.BorderBrush = Brush(ColorHelper.FromArgb(255, 90, 81, 56));
        content.Children.Add(techniquePanel);
        content.Children.Add(Text("Fingering code \u00b7 X closed / H half / O open", 11, Muted));
        code.FontFamily = new FontFamily("Consolas");
        code.CharacterSpacing = 160;
        Identify(code, "FingeringCode");
        content.Children.Add(code);
        alternateRow.ColumnDefinitions.Add(new ColumnDefinition());
        alternateRow.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
        alternateRow.Children.Add(Text("Use alternate Pa fingering\n(H1 open, H2\u2013H6 closed)", 12, Muted));
        alternateRow.Children.Add(alternate);
        Grid.SetColumn(alternate, 1);
        Identify(alternate, "AlternatePa", "Use alternate Pa fingering (H1 open, H2 to H6 closed)");
        alternate.Toggled += (_, _) => SetAlternate();
        content.Children.Add(alternateRow);
        var panel = Panel(content);
        panel.VerticalAlignment = VerticalAlignment.Top;
        return panel;
    }

    private Border BuildMap()
    {
        var content = new StackPanel { Spacing = 12 };
        content.Children.Add(Text("Swara map", 20, Ink, true));
        content.Children.Add(Text("Sa-relative swaras \u00b7 flute-specific holes", 12, Muted));
        Identify(rows, "NoteList", "Thaat note map");
        rows.ItemContainerStyle = (Style)Application.Current.Resources["BansuriNoteItemStyle"];
        ScrollViewer.SetVerticalScrollBarVisibility(rows, ScrollBarVisibility.Disabled);
        ScrollViewer.SetVerticalScrollMode(rows, ScrollMode.Disabled);
        rows.SelectionChanged += (_, _) => { if (!updating && rows.SelectedItem is ListViewItem item) SelectNote((string)item.Tag); };
        content.Children.Add(rows);
        content.Children.Add(Text("The six dots in each row are holes 1\u20136, from nearest the blowing end to furthest away. Swara identity comes from the selected reference bansuri\u2019s Sa and the chosen thaat. The Western pitch is a separate sounding-pitch readout; it does not rename the swara.", 11, Muted));
        return Panel(content, 18);
    }

    private void Render()
    {
        updating = true;
        try
        {
            thaat.SelectedItem = state.Thaat;
            for (var i = 0; i < 12; i++)
            {
                var root = Mapper.Root(i, state.Flats);
                ((ComboBoxItem)reference.Items[i]).Content = $"{root} bansuri \u00b7 Sa sounds {root}";
                ((ComboBoxItem)flute.Items[i]).Content = $"{root} bansuri \u00b7 Sa sounds {root}";
            }
            reference.SelectedIndex = state.Reference; flute.SelectedIndex = state.Flute;
            sharps.IsChecked = !state.Flats; flats.IsChecked = state.Flats;
            alternate.IsOn = state.Alternate;
            var refName = Mapper.Root(state.Reference, state.Flats);
            var fluteName = Mapper.Root(state.Flute, state.Flats);
            summary.Text = $"{state.Thaat} / {refName} reference \u00b7 {fluteName} flute";
            pills.Text = $"Reference bansuri Sa = {refName}    \u00b7    Mapped flute = {fluteName}    \u00b7    Notation = {(state.Flats ? "Flats (\u266d)" : "Sharps (#)")}    \u00b7    Sa = H1\u2013H3 closed";
            sequence.Inlines.Clear();
            sequence.Inlines.Add(new Run { Text = $"SARGAM \u00b7 PITCH READOUT FOR {refName} REFERENCE   ", Foreground = Brush(Muted), FontSize = 11, FontFamily = new FontFamily("Segoe UI") });
            var notes = state.Notes;
            for (var i = 0; i < notes.Count; i++)
            {
                if (i > 0) sequence.Inlines.Add(new Run { Text = "  \u2192  ", Foreground = Brush(Muted) });
                sequence.Inlines.Add(new Run { Text = $"{notes[i].Swara.Token} " });
                sequence.Inlines.Add(new Run { Text = notes[i].Pitch, Foreground = Brush(Gold) });
            }
            RenderRows(notes);
            var note = state.Detail;
            selected.Text = note.Swara.Token; pitch.Text = note.Pitch;
            frequency.Text = $"{note.FrequencyText} Hz \u00b7 sounding pitch";
            relative.Text = note.RelativeText;
            techniqueTitle.Text = note.TechniqueTitle; techniqueText.Text = note.TechniqueText;
            code.Text = note.Fingering.Pattern;
            alternateRow.Visibility = note.CanAlternate ? Visibility.Visible : Visibility.Collapsed;
            holes.Children.Clear();
            for (var i = 0; i < 6; i++)
            {
                var ch = note.Fingering.Pattern[i];
                var stack = new StackPanel { Spacing = 6, HorizontalAlignment = HorizontalAlignment.Center };
                var circle = Hole(ch, 32);
                Identify(circle, $"Hole{i + 1}", $"Hole {i + 1}: {HoleName(ch)}");
                stack.Children.Add(circle);
                stack.Children.Add(Text($"H{i + 1}", 10, Muted));
                stack.Children.Add(Text(HoleName(ch), 9, Muted));
                foreach (var text in stack.Children.OfType<TextBlock>()) text.HorizontalAlignment = HorizontalAlignment.Center;
                Grid.SetColumn(stack, i); holes.Children.Add(stack);
            }
        }
        finally { updating = false; }
    }

    private void RenderRows(IReadOnlyList<MappedNote> notes)
    {
        // Preserve the focused list item while refreshing the pitch readouts.
        if (rows.Items.Count != notes.Count || rows.Items.OfType<ListViewItem>().Select(item => (string)item.Tag).Where((key, i) => key != notes[i].Swara.Key).Any())
        {
            rows.Items.Clear();
            foreach (var note in notes)
            {
                var item = new ListViewItem { Tag = note.Swara.Key };
                Identify(item, $"Note_{note.Swara.Key}");
                rows.Items.Add(item);
            }
        }
        rowGrids.Clear();
        for (var i = 0; i < notes.Count; i++)
        {
            var note = notes[i];
            var item = (ListViewItem)rows.Items[i];
            AutomationProperties.SetName(item, $"{note.Swara.Name}, {note.Pitch}, {note.RelativeText}, {note.FrequencyText} Hz, {note.Fingering.Pattern}");
            var row = new Grid { ColumnSpacing = 10, RowSpacing = 6 };
            row.Children.Add(Text(note.Swara.Token, 23, Gold, true));
            var name = new StackPanel { Spacing = 3 };
            name.Children.Add(Text(note.Swara.Name, 14)); name.Children.Add(Text(note.Swara.Subtitle, 12, Muted));
            row.Children.Add(name);
            var readout = new StackPanel { Spacing = 3 };
            readout.Children.Add(Text(note.Pitch, 18, Ink, true)); readout.Children.Add(Text($"{note.RelativeText} \u00b7 {note.FrequencyText} Hz", 12, Muted));
            row.Children.Add(readout);
            var mini = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 4, VerticalAlignment = VerticalAlignment.Center };
            foreach (var ch in note.Fingering.Pattern) mini.Children.Add(Hole(ch, 12));
            ToolTipService.SetToolTip(mini, string.Join(", ", note.Fingering.Pattern.Select((ch, h) => $"H{h + 1}: {HoleName(ch)}")));
            row.Children.Add(mini);
            rowGrids.Add(row); LayoutRow(row); item.Content = row;
            if (state.Selected == note.Swara.Key) rows.SelectedItem = item;
        }
    }

    private void SetNotation(bool useFlats)
    {
        if (updating) return;
        state.Flats = useFlats;
        Render();
    }

    private void SetAlternate()
    {
        if (updating) return;
        state.Alternate = alternate.IsOn;
        Render();
    }

    private void SelectNote(string key)
    {
        if (updating) return;
        state.Select(key);
        Render();
    }

    private void Layout(double width)
    {
        compact = width <= 560;
        headingTitle.FontSize = compact ? 28 : 40;
        var settingColumns = width > 1000 ? 4 : width > 560 ? 2 : 1;
        ArrangeGrid(settings, settingColumns, 5);
        Grid.SetColumnSpan((FrameworkElement)settings.Children[4], settingColumns);
        Grid.SetRow((FrameworkElement)settings.Children[4], (4 + settingColumns - 1) / settingColumns);
        Grid.SetColumn((FrameworkElement)settings.Children[4], 0);
        var split = width > 820;
        ArrangeGrid(workspace, split ? 2 : 1, 2);
        if (split)
        {
            workspace.ColumnDefinitions[0].Width = new GridLength(0.82, GridUnitType.Star);
            workspace.ColumnDefinitions[0].MinWidth = 330;
            workspace.ColumnDefinitions[1].Width = new GridLength(1.5, GridUnitType.Star);
        }
        ArrangeGrid(information, compact ? 1 : 2, 2);
        foreach (var row in rowGrids) LayoutRow(row);
        UpdateStickyDetail();
    }

    private void UpdateStickyDetail()
    {
        if (workspace.Children.Count == 0) return;
        var detail = (FrameworkElement)workspace.Children[0];
        if (shell.ActualWidth <= 820 || detail.ActualHeight + 32 > scroll.ViewportHeight)
        {
            detailOffset.Y = 0;
            return;
        }
        var top = workspace.TransformToVisual(shell).TransformPoint(new Point()).Y + scroll.Padding.Top;
        detailOffset.Y = Math.Clamp(scroll.VerticalOffset - top + 16, 0, Math.Max(0, workspace.ActualHeight - detail.ActualHeight));
    }

    private void LayoutRow(Grid row)
    {
        row.ColumnDefinitions.Clear(); row.RowDefinitions.Clear();
        row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(compact ? 38 : 42) });
        row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(0.8, GridUnitType.Star) });
        row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.2, GridUnitType.Star) });
        if (!compact) row.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(96) });
        row.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        row.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        for (var i = 0; i < 4; i++)
        {
            Grid.SetColumn((FrameworkElement)row.Children[i], compact && i == 3 ? 1 : i);
            Grid.SetRow((FrameworkElement)row.Children[i], compact && i == 3 ? 1 : 0);
            Grid.SetColumnSpan((FrameworkElement)row.Children[i], compact && i == 3 ? 2 : 1);
        }
    }

    private static void ArrangeGrid(Grid grid, int columns, int count)
    {
        grid.ColumnDefinitions.Clear(); grid.RowDefinitions.Clear();
        for (var i = 0; i < columns; i++) grid.ColumnDefinitions.Add(new ColumnDefinition());
        for (var i = 0; i <= count / columns; i++) grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
        for (var i = 0; i < count; i++) { var child = (FrameworkElement)grid.Children[i]; Grid.SetColumn(child, i % columns); Grid.SetRow(child, i / columns); Grid.SetColumnSpan(child, 1); }
    }

    private static StackPanel Field(string label, FrameworkElement input, string help, string id)
    {
        var field = new StackPanel { Spacing = 8 };
        field.Children.Add(Text(label, 14, Ink, true));
        input.HorizontalAlignment = HorizontalAlignment.Stretch;
        input.MinHeight = 40;
        Identify(input, id, label);
        AutomationProperties.SetHelpText(input, help);
        field.Children.Add(input); field.Children.Add(Text(help, 12, Muted));
        return field;
    }

    private static Border Info(string title, string body)
    {
        var content = new StackPanel { Spacing = 7 };
        content.Children.Add(Text(title, 11, Gold)); content.Children.Add(Text(body, 12, Muted));
        return Panel(content, 16);
    }
    private static TextBlock Text(string text, double size, Color? color = null, bool heading = false) => new()
    {
        Style = (Style)Application.Current.Resources[heading ? "BansuriHeadingTextStyle" : "BansuriBodyTextStyle"],
        Text = text,
        FontSize = size,
        Foreground = Brush(color ?? Ink),
        TextWrapping = TextWrapping.Wrap
    };
    private static Color ThemeColor(string key) => (Color)Application.Current.Resources[key];
    private static SolidColorBrush Brush(Color color) => new(color);
    private static Border Panel(UIElement content, double padding = 20) => new()
    {
        Child = content,
        Padding = new Thickness(padding),
        CornerRadius = new CornerRadius(12),
        BorderBrush = Brush(Line),
        BorderThickness = new Thickness(1),
        Background = Brush(ThemeColor("BansuriSurfaceColor"))
    };
    private static string HoleName(char ch) => ch == 'X' ? "Closed" : ch == 'H' ? "Half" : "Open";
    private static Grid Hole(char ch, double size)
    {
        var grid = new Grid { Width = size, Height = size, VerticalAlignment = VerticalAlignment.Center };
        var halfColor = ColorHelper.FromArgb(255, 229, 189, 114);
        Brush fill = Brush(Colors.Transparent);
        if (ch == 'X') fill = Brush(Mint);
        else if (ch == 'H') fill = new LinearGradientBrush
        {
            StartPoint = new Point(0, 0),
            EndPoint = new Point(1, 0),
            GradientStops = { new GradientStop { Color = halfColor, Offset = 0 }, new GradientStop { Color = halfColor, Offset = 0.5 }, new GradientStop { Color = Colors.Transparent, Offset = 0.5 }, new GradientStop { Color = Colors.Transparent, Offset = 1 } }
        };
        grid.Children.Add(new Ellipse { Fill = fill, Stroke = Brush(ch == 'X' ? Mint : ch == 'H' ? halfColor : Muted), StrokeThickness = size > 20 ? 2 : 1.3 });
        if (size > 20 && ch != 'O') grid.Children.Add(new TextBlock { Text = ch == 'X' ? "X" : "\u00bd", FontSize = 10, FontWeight = Microsoft.UI.Text.FontWeights.Bold, Foreground = Brush(ColorHelper.FromArgb(255, 21, 32, 28)), HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center });
        return grid;
    }
    private static void Identify(DependencyObject element, string id, string? name = null)
    {
        AutomationProperties.SetAutomationId(element, id);
        if (name != null) AutomationProperties.SetName(element, name);
    }
}
