using System.Globalization;

namespace BansuriMapper;

public sealed record Swara(string Key, string Name, int Interval, string Subtitle)
{
    public string Token => Key switch { "S" => "Sa", "S'" => "Sa\u2032", "M#" => "M\u266f", _ => Key };
}

public sealed record Fingering(string Name, string Pattern, string Hint, bool Alternate = false);
public sealed record MappedNote(Swara Swara, string Pitch, double Frequency, int Midi, int Relative, Fingering Fingering)
{
    public string FrequencyText => Frequency.ToString("F1", CultureInfo.InvariantCulture);
    public string RelativeText => Mapper.RelativeDescription(Relative);
    public string TechniqueTitle => $"{Fingering.Name} \u00b7 {Mapper.Register(Relative)}";
    public bool CanAlternate => Mapper.Modulo12(Relative) == 7 && Relative >= 7;
    public string TechniqueText => (Fingering.Alternate
        ? "Alternate Pa fingering: leave H1 open and close H2\u2013H6. Compare it with all six holes closed against the Sa drone."
        : Fingering.Hint) + (Relative < 0
        ? " This note is below the flute\u2019s Sa, so use the lower-register, gentler air stream."
        : Relative >= 12 && Relative <= 18
        ? " This is in the taar saptak; use a faster, narrower air stream."
        : Relative >= 7 ? " This note needs a focused upper-register air stream." : "");
}

public static class Mapper
{
    public static readonly IReadOnlyDictionary<string, string[]> Thaats = new Dictionary<string, string[]>
    {
        ["Bhairav"] = ["S", "r", "G", "M", "P", "d", "N", "S'"],
        ["Bilawal"] = ["S", "R", "G", "M", "P", "D", "N", "S'"],
        ["Khamaj"] = ["S", "R", "G", "M", "P", "D", "n", "S'"],
        ["Kafi"] = ["S", "R", "g", "M", "P", "D", "n", "S'"],
        ["Asavari"] = ["S", "R", "g", "M", "P", "d", "n", "S'"],
        ["Bhairavi"] = ["S", "r", "g", "M", "P", "d", "n", "S'"],
        ["Kalyan"] = ["S", "R", "G", "M#", "P", "D", "N", "S'"],
        ["Marwa"] = ["S", "r", "G", "M#", "D", "N", "S'"],
        ["Poorvi"] = ["S", "r", "G", "M#", "P", "d", "N", "S'"],
        ["Todi"] = ["S", "r", "g", "M#", "P", "d", "N", "S'"]
    };
    private static readonly Swara[] Swaras =
    [
        new("S", "Sa", 0, "Tonic"), new("r", "Komal Re", 1, "Flattened second"),
        new("R", "Shuddha Re", 2, "Major second"), new("g", "Komal Ga", 3, "Flattened third"),
        new("G", "Shuddha Ga", 4, "Major third"), new("M", "Shuddha Ma", 5, "Perfect fourth"),
        new("M#", "Tivra Ma", 6, "Raised fourth"), new("P", "Pa", 7, "Perfect fifth"),
        new("d", "Komal Dha", 8, "Flattened sixth"), new("D", "Shuddha Dha", 9, "Major sixth"),
        new("n", "Komal Ni", 10, "Flattened seventh"), new("N", "Shuddha Ni", 11, "Major seventh"),
        new("S'", "Taar Sa", 12, "Upper tonic")
    ];
    private static readonly string[] Sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    private static readonly string[] Flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    private static readonly string[] Patterns = ["XXXOOO", "XXHOOO", "XXOOOO", "XHOOOO", "XOOOOO", "HOOOOO", "OOOOOO", "XXXXXX", "XXXXXH", "XXXXXO", "XXXXHO", "XXXXOO"];
    private static readonly string[] Hints =
    [
        "Close H1, H2 and H3. Leave H4\u2013H6 open. This is the selected flute\u2019s Sa reference.",
        "Close H1 and H2; half-cover H3 to produce the semitone above Sa.",
        "Close H1 and H2; leave H3\u2013H6 open.",
        "Close H1 and half-cover H2. Fine-tune against the Sa drone.",
        "Close H1; leave H2\u2013H6 open.",
        "Half-cover H1 and leave H2\u2013H6 open. Roll the finger to tune the note.",
        "Lift all six fingers. An alternate cross-fingering may speak more cleanly on some flutes.",
        "Close all six holes and use a faster, narrower air stream for madhya Pa. An alternate fingering is H1 open and H2\u2013H6 closed.",
        "Close H1\u2013H5 and half-cover H6. Use focused air and tune against the drone.",
        "Close H1\u2013H5 and leave H6 open. Use focused air.",
        "Close H1\u2013H4, half-cover H5 and leave H6 open.",
        "Close H1\u2013H4 and leave H5\u2013H6 open."
    ];

    public static int Modulo12(int n) => (n % 12 + 12) % 12;
    public static int FluteOffset(int pitchClass) => pitchClass >= 6 ? pitchClass - 12 : pitchClass;
    public static string Root(int pitchClass, bool flats) => (flats ? Flats : Sharps)[Modulo12(pitchClass)];
    public static MappedNote Map(string key, int reference, int flute, bool flats, bool alternate)
    {
        var swara = Swaras.First(s => s.Key == key);
        var midi = 60 + FluteOffset(reference) + swara.Interval;
        var relative = midi - 60 - FluteOffset(flute);
        var index = Modulo12(relative);
        var useAlt = alternate && index == 7 && relative >= 7;
        return new(swara, $"{Root(midi, flats)}{midi / 12 - 1}", 440 * Math.Pow(2, (midi - 69) / 12.0), midi, relative,
            new(Swaras[index].Name, useAlt ? "OXXXXX" : Patterns[index], Hints[index], useAlt));
    }
    public static string Register(int relative) => relative switch
    {
        < 0 => "Mandra \u00b7 lower register",
        <= 6 => "Madhya \u00b7 normal register",
        <= 11 => "Madhya \u00b7 upper register",
        <= 18 => "Taar \u00b7 upper octave",
        _ => "Ati-taar \u00b7 higher octave"
    };
    public static string RelativeDescription(int relative)
    {
        if (relative == 0) return "Same as this flute\u2019s Sa";
        var amount = Math.Abs(relative);
        return $"{amount} {(amount == 1 ? "semitone" : "semitones")} {(relative < 0 ? "below" : "above")} flute Sa \u00b7 {Swaras[Modulo12(relative)].Name}{(relative < 0 ? " \u00b7 Mandra" : relative >= 12 ? " \u00b7 Taar" : "")}";
    }
}

public sealed class MapperState
{
    public string Thaat { get; private set; } = "Bhairav";
    public int Reference { get; private set; }
    public int Flute { get; private set; }
    public bool Flats { get; set; }
    public bool Alternate { get; set; }
    public string Selected { get; private set; } = "S";
    public IReadOnlyList<MappedNote> Notes => Mapper.Thaats[Thaat].Select(k => Mapper.Map(k, Reference, Flute, Flats, Alternate)).ToArray();
    public MappedNote Detail => Mapper.Map(Selected, Reference, Flute, Flats, Alternate);
    public void Select(string key) { if (Mapper.Thaats[Thaat].Contains(key)) Selected = key; }
    public void SetThaat(string thaat) { if (!Mapper.Thaats.ContainsKey(thaat)) throw new ArgumentException("Unknown thaat", nameof(thaat)); Thaat = thaat; Selected = "S"; Alternate = false; }
    public void SetReference(int value) { ArgumentOutOfRangeException.ThrowIfNegative(value); ArgumentOutOfRangeException.ThrowIfGreaterThan(value, 11); Reference = value; Alternate = false; }
    public void SetFlute(int value) { ArgumentOutOfRangeException.ThrowIfNegative(value); ArgumentOutOfRangeException.ThrowIfGreaterThan(value, 11); Flute = value; Alternate = false; }
    public void Reset() { Thaat = "Bhairav"; Reference = Flute = 0; Flats = Alternate = false; Selected = "S"; }
}
