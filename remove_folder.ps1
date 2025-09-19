$folderPath = "d:\VSCODE\react-learning\TYHH ADMIN\src\app\(dashboard)\users\[username]"
if (Test-Path $folderPath) {
    Remove-Item -Path $folderPath -Recurse -Force
    Write-Host "Folder removed successfully"
} else {
    Write-Host "Folder not found"
}