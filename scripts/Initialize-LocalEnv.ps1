# GENERA LOS VALORES LOCALES FALTANTES SIN CAMBIAR LAS CREDENCIALES EXISTENTES.
[CmdletBinding()]
param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$projectDirectory = (Resolve-Path -LiteralPath $ProjectRoot).Path
$envFile = Join-Path $projectDirectory '.env'
$exampleFile = Join-Path $projectDirectory '.env.example'
$newFile = -not (Test-Path -LiteralPath $envFile)
$sourceFile = if ($newFile) { $exampleFile } else { $envFile }
$envLines = New-Object 'System.Collections.Generic.List[string]'
foreach ($line in [IO.File]::ReadAllLines($sourceFile)) { $envLines.Add($line) }
$randomSource = [Security.Cryptography.RandomNumberGenerator]::Create()

function New-LocalSecret {
    $bytes = New-Object byte[] 48
    $randomSource.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

function New-LocalPin {
    $digits = New-Object Text.StringBuilder
    $sample = New-Object byte[] 1
    while ($digits.Length -lt 6) {
        $randomSource.GetBytes($sample)
        if ($sample[0] -lt 250) { [void]$digits.Append(([int]$sample[0] % 10).ToString()) }
    }
    return $digits.ToString()
}

$generators = [ordered]@{
    POSTGRES_PASSWORD = { New-LocalSecret }
    JWT_KEY = { New-LocalSecret }
    JWT_EXPIRATION_MINUTES = { '720' }
    SEED_ENABLED = { 'true' }
    SEED_PASSWORD_LUPITA = { New-LocalPin }
    SEED_PASSWORD_LUCIA = { New-LocalPin }
    SEED_PASSWORD_ANGEL = { New-LocalPin }
    PGADMIN_EMAIL = { 'admin@lupita.com' }
    PGADMIN_PASSWORD = { New-LocalSecret }
}

$generated = 0
try {
    foreach ($entry in $generators.GetEnumerator()) {
        $key = [string]$entry.Key
        $matchingIndices = @()
        for ($index = 0; $index -lt $envLines.Count; $index++) {
            if ($envLines[$index] -match ('^\s*' + [regex]::Escape($key) + '\s*=')) { $matchingIndices += $index }
        }
        if ($matchingIndices.Count -gt 1) { throw "La variable $key aparece varias veces en .env. Deja una sola definición." }
        $missing = $matchingIndices.Count -eq 0
        if (-not $missing) {
            $currentValue = ($envLines[$matchingIndices[0]] -split '=', 2)[1].Trim()
            $missing = $currentValue -eq '' -or $currentValue -eq '""' -or $currentValue -eq "''" -or $currentValue.StartsWith('#')
        }
        if ($missing -or ($newFile -and $key -eq 'SEED_ENABLED')) {
            $value = & $entry.Value
            if ($matchingIndices.Count) { $envLines[$matchingIndices[0]] = "$key=$value" }
            else { $envLines.Add("$key=$value") }
            $generated++
        }
    }
    $temporaryFile = Join-Path $projectDirectory ('.env.tmp.' + [Guid]::NewGuid().ToString('N'))
    [IO.File]::WriteAllLines($temporaryFile, $envLines, (New-Object Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $temporaryFile -Destination $envFile -Force
    $frontendEnv = Join-Path $projectDirectory 'frontend/.env'
    if (-not (Test-Path -LiteralPath $frontendEnv)) {
        Copy-Item -LiteralPath (Join-Path $projectDirectory 'frontend/.env.example') -Destination $frontendEnv
    }
    Write-Output "Configuración local lista. Se generaron $generated valores faltantes."
    Write-Output 'Los PIN de los usuarios de prueba y las claves están guardados en .env.'
    Write-Output 'Las credenciales que ya tenían valor se conservaron.'
} finally {
    $randomSource.Dispose()
    if ($temporaryFile -and (Test-Path -LiteralPath $temporaryFile)) { Remove-Item -LiteralPath $temporaryFile -Force }
}
