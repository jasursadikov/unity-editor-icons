#if UNITY_EDITOR

using System;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using UnityEditor;
using UnityEngine;

public static class IconsReadmeGenerator
{
    const string README = "README.md";
    const string ICONS_DIR = "img";
    const string ICONS_LIST = "list.txt";

    [MenuItem("Tools/Print Icons to README.md")]
    public static void SaveAll()
    {
        var readme = Path.Combine(Application.streamingAssetsPath, README);
        var iconsList = Path.Combine(Application.streamingAssetsPath, ICONS_LIST);
        var iconsDir = Path.Combine(Application.streamingAssetsPath, ICONS_DIR);

        if (File.Exists(readme))
            File.Delete(readme);

        using var writer = new StreamWriter(File.OpenWrite(readme));
        var icons = File.ReadAllLines(iconsList);

        if (!Directory.Exists(iconsDir))
            Directory.CreateDirectory(iconsDir);

        writer.WriteLine($"# Unity {Application.unityVersion} Editor Icons List");

        var textures = new Texture2D[icons.Length];

        for (int i = 0; i < icons.Length; i++)
        {
            try
            {
                textures[i] = EditorGUIUtility.IconContent(icons[i]).image as Texture2D;
            }
            catch (Exception exception)
            {
                Debug.LogError(exception);
            }
        }

        textures = textures.Where(x => x != null).Distinct().OrderBy(x => x.width * x.height).ToArray();

        writer.WriteLine("| Icon | Size | Name |");
        writer.WriteLine("| --- | --- | --- |");

        for (int i = 0; i < textures.Length; i++)
        {
            try
            {
                var path = Path.Combine(iconsDir, $"{textures[i].name}.png");
                var texture = new Texture2D(textures[i].width, textures[i].height, textures[i].format, textures[i].mipmapCount, true);

                Graphics.CopyTexture(textures[i], texture);
                File.WriteAllBytes(path, texture.EncodeToPNG());

                writer.WriteLine($"| <img src=\"{ICONS_DIR}/{textures[i].name}.png\" alt=\"{textures[i].name}\" width=\"16\" height=\"16\"> | `{textures[i].width}x{textures[i].height}` | `{textures[i].name}` |");
            }
            catch (Exception exception)
            {
                Debug.LogError($"Failed to save a file: {exception.Message}");
            }
        }
    }
}

#endif