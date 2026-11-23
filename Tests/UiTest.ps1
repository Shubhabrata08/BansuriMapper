param([Parameter(Mandatory)][string]$Hwnd)
$ErrorActionPreference = 'Stop'
$fixture = Get-Content (Join-Path $PSScriptRoot '..\artifacts\reference.json') -Raw | ConvertFrom-Json
$steps = [System.Collections.Generic.List[object]]::new()
function Step($command, $arguments) { $steps.Add(@{command=$command;args=$arguments}) }
function Check($id, $value) { Step 'assert' @{'automation-id'=$id;condition='NameEquals';value=$value;timeout='2'} }
function Toggle($id, $value='on') { Step 'uia-invoke' @{id=$id;pattern='toggle';value=$value} }
function SelectIndex($id, $index) {
    Step 'uia-invoke' @{id=$id;pattern='expand';value='collapse'}
    Step 'uia-invoke' @{id=$id;pattern='focus'}
    Step 'type' @{keys=('{HOME}' + ('{DOWN}' * $index) + '{ENTER}')}
    Step 'uia-invoke' @{id=$id;pattern='expand';value='collapse'}
}
function Reset { Step 'uia-invoke' @{id='Reset';pattern='invoke'} }
function NoteCheck($expected) {
    Check 'SelectedPitch' $expected.pitch
    Check 'FingeringCode' $expected.pattern
    Check 'SelectedRelative' $expected.relativeText
    Check 'TechniqueTitle' $expected.title
}

Reset
Check 'SelectedPitch' 'C4'
Check 'FingeringCode' 'XXXOOO'
Toggle 'Note_r'
Check 'SelectedPitch' 'C#4'
Check 'FingeringCode' 'XXHOOO'
Toggle 'FlatMode'
Check 'SelectedPitch' 'Db4'
Toggle 'Note_P'
Check 'FingeringCode' 'XXXXXX'
Toggle 'AlternatePa'
Check 'FingeringCode' 'OXXXXX'
Toggle 'Note_S'
Toggle 'Note_P'
Check 'FingeringCode' 'OXXXXX'
Toggle 'SharpMode'
Check 'FingeringCode' 'OXXXXX'
SelectIndex 'ReferenceSelect' 0
# Changing an actual key clears alternate, while preserving the selected swara.
SelectIndex 'ReferenceSelect' 4
Check 'SelectedSwar' 'P'
Check 'FingeringCode' 'XXXXOO'
Step 'assert' @{'automation-id'='AlternatePa';condition='NotExists'}
Reset
for ($pc=0; $pc -lt 12; $pc++) {
    SelectIndex 'ReferenceSelect' $pc
    $expected = $fixture.cases | Where-Object { $_.thaat -eq 'Bhairav' -and $_.key -ceq 'S' -and $_.reference -eq $pc -and $_.flute -eq 0 -and !$_.flats -and !$_.alternate } | Select-Object -First 1
    NoteCheck $expected
}
Reset
for ($pc=0; $pc -lt 12; $pc++) {
    SelectIndex 'FluteSelect' $pc
    $expected = $fixture.cases | Where-Object { $_.thaat -eq 'Bhairav' -and $_.key -ceq 'S' -and $_.reference -eq 0 -and $_.flute -eq $pc -and !$_.flats -and !$_.alternate } | Select-Object -First 1
    NoteCheck $expected
}
Reset
$thaats = @($fixture.thaats.PSObject.Properties.Name)
for ($index=0; $index -lt $thaats.Count; $index++) {
    SelectIndex 'ThaatSelect' $index
    Check 'SelectedSwar' 'Sa'
    $name = $thaats[$index]
    foreach ($key in $fixture.thaats.$name) {
        Step 'assert' @{'automation-id'="Note_$key";condition='Exists'}
    }
    if ($name -eq 'Marwa') { Step 'assert' @{'automation-id'='Note_P';condition='NotExists'} }
    Toggle "Note_S'"
    Check 'SelectedPitch' 'C5'
}
Reset
Check 'SelectedPitch' 'C4'
Check 'FingeringCode' 'XXXOOO'
Step 'assert' @{'automation-id'='SharpMode';condition='ToggleOn'}
Step 'assert' @{'automation-id'='FlatMode';condition='ToggleOff'}

hyperloop context local:// --title 'Verifying all thaats, flute keys, spelling, alternate Pa and reset'
$batchFile = Join-Path $PSScriptRoot '..\artifacts\ui-steps.json'
$steps | ConvertTo-Json -Depth 6 | Set-Content $batchFile
$result = hyperloop batch local:// --hwnd $Hwnd --file $batchFile 2>$null | ConvertFrom-Json
$output = Join-Path $PSScriptRoot '..\artifacts\ui-results.json'
$result | ConvertTo-Json -Depth 12 | Set-Content $output
$result | Select-Object total,passed,failed | ConvertTo-Json
if ($result.failed -or $result.error -or $result.total -ne $steps.Count) {
    $result.results | Where-Object { !$_.success } | ConvertTo-Json -Depth 6
    throw 'Native UI validation failed.'
}
Write-Host "PASS: $($result.passed) native UI actions/assertions. Evidence: $output"
