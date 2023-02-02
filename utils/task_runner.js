var wshShell = new ActiveXObject("WScript.Shell");
var env = wshShell.Environment('Process');
wshShell.CurrentDirectory = env.item("LOCALAPPDATA")+"\\Programs\\VRChat-Exif-Writer";
var ret = wshShell.Run('node src\\main.js', 0, true);
WScript.Quit(ret);
