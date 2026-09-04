$activeAdapter =
    [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
    Where-Object {
        $_.OperationalStatus -eq
            [System.Net.NetworkInformation.OperationalStatus]::Up -and
        $_.NetworkInterfaceType -ne
            [System.Net.NetworkInformation.NetworkInterfaceType]::Loopback -and
        $_.GetIPProperties().GatewayAddresses.Count -gt 0
    } |
    Select-Object -First 1

if (-not $activeAdapter) {
    throw "No active network adapter was found."
}

$apiAddress =
    $activeAdapter.GetIPProperties().UnicastAddresses |
    Where-Object {
        $_.Address.AddressFamily -eq
            [System.Net.Sockets.AddressFamily]::InterNetwork
    } |
    Select-Object -First 1 -ExpandProperty Address

if (-not $apiAddress) {
    throw "No active IPv4 address was found."
}

$apiEnvPath = Join-Path $PSScriptRoot ".env.local"

@(
    "EXPO_PUBLIC_API_URL=http://${apiAddress}:5229"
    "EXPO_PUBLIC_USE_RN_FETCH=1"
) |
    Set-Content -LiteralPath $apiEnvPath -Encoding ascii

Write-Host "API URL: http://${apiAddress}:5229"
