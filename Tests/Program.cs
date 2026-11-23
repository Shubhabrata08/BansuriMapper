using System.Text.Json;
using BansuriMapper;

var checks = 0;
void Equal<T>(T actual, T expected, string context)
{
    if (!EqualityComparer<T>.Default.Equals(actual, expected)) throw new Exception($"{context}: expected '{expected}', got '{actual}'");
    checks++;
}

using var fixture = JsonDocument.Parse(File.ReadAllText(args[0]));
foreach (var thaat in fixture.RootElement.GetProperty("thaats").EnumerateObject())
    Equal(string.Join(",", Mapper.Thaats[thaat.Name]), string.Join(",", thaat.Value.EnumerateArray().Select(v => v.GetString())), thaat.Name);
var count = 0;
foreach (var item in fixture.RootElement.GetProperty("cases").EnumerateArray())
{
    string S(string key) => item.GetProperty(key).GetString()!;
    int I(string key) => item.GetProperty(key).GetInt32();
    bool B(string key) => item.GetProperty(key).GetBoolean();
    var note = Mapper.Map(S("key"), I("reference"), I("flute"), B("flats"), B("alternate"));
    var label = $"{S("thaat")}/{S("key")}/{I("reference")}/{I("flute")}/{B("flats")}/{B("alternate")}";
    Equal(note.Swara.Name, S("name"), label + " name");
    Equal(note.Swara.Subtitle, S("subtitle"), label + " subtitle");
    Equal(note.Swara.Token, S("token"), label + " token");
    Equal(note.Pitch, S("pitch"), label + " pitch");
    Equal(note.Midi, I("midi"), label + " midi");
    Equal(Math.Abs(note.Frequency - item.GetProperty("frequency").GetDouble()) < 1e-9, true, label + " frequency");
    Equal(note.Relative, I("relative"), label + " relative");
    Equal(note.RelativeText, S("relativeText"), label + " relative text");
    Equal(note.Fingering.Pattern, S("pattern"), label + " holes");
    Equal(note.TechniqueTitle, S("title"), label + " title");
    Equal(note.TechniqueText, S("hint"), label + " hint");
    Equal(note.CanAlternate, B("canAlternate"), label + " alternate visibility");
    count++;
}
var state = new MapperState();
state.Select("P"); state.Alternate = true;
Equal(state.Detail.Fingering.Pattern, "OXXXXX", "Alternate Pa");
state.Select("S"); state.Select("P");
Equal(state.Detail.Fingering.Pattern, "OXXXXX", "Alternate survives note selection");
state.Flats = true;
Equal(state.Alternate, true, "Notation preserves alternate");
state.SetReference(4);
Equal(state.Selected, "P", "Reference preserves selection");
Equal(state.Alternate, false, "Reference clears alternate");
state.Alternate = true; state.SetFlute(6);
Equal(state.Alternate, false, "Flute clears alternate");
Equal(state.Selected, "P", "Flute preserves selection");
state.Alternate = true; state.SetThaat("Marwa");
Equal(state.Selected, "S", "Thaat selects Sa");
Equal(state.Alternate, false, "Thaat clears alternate");
Equal(state.Notes.Count, 7, "Source Marwa omits Pa");
state.Select("P"); Equal(state.Selected, "S", "Absent selection ignored");
state.Reset();
Equal(state.Thaat, "Bhairav", "Reset thaat"); Equal(state.Reference, 0, "Reset reference");
Equal(state.Flute, 0, "Reset flute"); Equal(state.Flats, false, "Reset spelling");
Equal(state.Alternate, false, "Reset alternate"); Equal(state.Selected, "S", "Reset selection");
Equal(state.Detail.Pitch, "C4", "Default pitch");
Equal(state.Detail.Fingering.Pattern, "XXXOOO", "Default fingering");
Console.WriteLine($"PASS: {count:N0} HTML parity cases and {checks:N0} assertions, including state transitions.");
