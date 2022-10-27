#if UNITY_EDITOR

using System;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class IconsReadmeGenerator
{
    const string README = "README.md";
    const string ICONS_DIR = "img";
    const string ICONS_LIST = "list.txt";
    const int COLOUMS_COUNT = 2;

    [MenuItem("Tools/Print Icons to README.md")]
    public static void SaveAll()
    {
        var readme = Path.Combine(Application.streamingAssetsPath, README);
        var iconsList = Path.Combine(Application.streamingAssetsPath, ICONS_LIST);
        var iconsDir = Path.Combine(Application.streamingAssetsPath, ICONS_DIR);

        if (File.Exists(readme))
            File.Delete(readme);

        var writer = new StreamWriter(File.OpenWrite(readme));
        var icons = File.ReadAllLines(iconsList);

        if (!Directory.Exists(iconsDir))
            Directory.CreateDirectory(iconsDir);

        writer.WriteLine($"# Unity {Application.unityVersion} Editor Icons List");
        writer.WriteLine("<table>");
        writer.WriteLine("<tbody>");

        bool trOpened = false;
        for (int i = 0, n = 0; i < icons.Length; i++, n++)
        {
            if (n == COLOUMS_COUNT && trOpened)
            {
                writer.WriteLine("</tr>");
                trOpened = false;
                n = 0;
            }

            if (n == 0 && !trOpened)
            {
                writer.WriteLine("<tr>");
                trOpened = true;
            }

            try
            {
                var icon = EditorGUIUtility.IconContent(icons[i]).image as Texture2D;
                
                if (icon == null)
                {
                    Debug.LogError("Cannot save the icon: null texture error!");
                    n--;
                    continue;
                }

                var path = Path.Combine(iconsDir, $"{icons[i]}.png");

                var texture = new Texture2D(icon.width, icon.height, icon.format, icon.mipmapCount, true);
                Graphics.CopyTexture(icon, texture);
                File.WriteAllBytes(path, texture.EncodeToPNG());
                writer.WriteLine($"<td width=20><img src=\"{ICONS_DIR}/{icons[i]}.png\" height=16 width=16></td><td width=24><code>{icon.width}x{icon.height}</code></td><td><code>{icons[i]}</code></td>");
            }
            catch (Exception exception)
            {
                Debug.LogError($"Failed to save a file: {exception.Message}");
                n--;
            }
        }

        writer.WriteLine("</tr>");
        writer.WriteLine("</tbody>");
        writer.WriteLine("</table>");

        writer.Dispose();
    }
}

#endif