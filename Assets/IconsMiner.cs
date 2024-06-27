// readAuthor of the original script: https://github.com/halak

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEngine;
using UnityEditor;

public static class IconsMiner
{
    private static StringBuilder iconDescriptionBuilder = new StringBuilder();
    
    [MenuItem("Unity Editor Icons/Generate README.md %g", priority = -1000)]
    private static void GenerateREADME()
    {
        var guidMaterial = new Material(Shader.Find("Unlit/Texture"));
        var guidMaterialId = Path.Combine("Assets", "GuidMaterial.mat");
        var coloumns = 10;
        var readme = "README.md";
        
        AssetDatabase.CreateAsset(guidMaterial, guidMaterialId);
        EditorUtility.DisplayProgressBar("Generate README.md", "Generating...", 0);

        try
        {
            var editorAssetBundle = GetEditorAssetBundle();
            var iconsPath = GetIconsPath();
            var readmeBuilder = new StringBuilder();

            readmeBuilder.AppendLine("# Unity Editor Built-in Icons");
            readmeBuilder.AppendLine($"Unity version **{Application.unityVersion}**");
            readmeBuilder.AppendLine();
            readmeBuilder.AppendLine("Load icons using `EditorGUIUtility.IconContent(<ICON NAME>);`");
            readmeBuilder.AppendLine();
            readmeBuilder.AppendLine("### File ID");
            readmeBuilder.AppendLine("You can change script icon by file id");
            readmeBuilder.AppendLine("1. Open meta file (ex. `*.cs.meta`) in Text Editor");
            readmeBuilder.AppendLine("2. Modify the line `icon: {instanceID: 0}` to `icon: {fileID: <FILE ID>, guid: 0000000000000000d000000000000000, type: 0}`");
            readmeBuilder.AppendLine("3. Save and focus Unity Editor");
            readmeBuilder.AppendLine();
            readmeBuilder.AppendLine("All icons are clickable, you will be forwarded to description file.");
            for (int index = 0; index < coloumns; index++)
                readmeBuilder.Append($"| {index + 1} ");
            readmeBuilder.Append("|");
            readmeBuilder.AppendLine();
            for (int index = 0; index < coloumns; index++)
                readmeBuilder.Append("| --- ");
            readmeBuilder.Append("|");
            readmeBuilder.AppendLine();

            var assetNames = EnumerateIcons(editorAssetBundle, iconsPath).ToArray();
            var iconsDirectoryPath = Path.Combine("img");
            var descriptionsDirectoryPath = Path.Combine("meta");
            
            if (!Directory.Exists(iconsDirectoryPath))
                Directory.CreateDirectory(iconsDirectoryPath);
            if (!Directory.Exists(descriptionsDirectoryPath))
                Directory.CreateDirectory(descriptionsDirectoryPath);

            for (int i = 0, n = 0; i < assetNames.Length; i++)
            {
                try
                {
                    var assetName = assetNames[i];
                    var icon = editorAssetBundle.LoadAsset<Texture2D>(assetName);
                
                    if (!icon && icon.isReadable)
                        continue;

                    EditorUtility.DisplayProgressBar($"Generate {readme}", $"Generating... ({i + 1}/{assetNames.Length})", (float)i / assetNames.Length);

                    var readableTexture = new Texture2D(icon.width, icon.height, icon.format, icon.mipmapCount > 1);
                    Graphics.CopyTexture(icon, readableTexture);

                    var iconPath = Path.Combine(iconsDirectoryPath, $"{icon.name}.png");
                    File.WriteAllBytes(iconPath, readableTexture.EncodeToPNG());

                    guidMaterial.mainTexture = icon;
                    AssetDatabase.SaveAssets();

                    var fileId = GetFileId(guidMaterialId);
                    iconPath = iconPath.Replace(" ", "%20").Replace('\\', '/');
                    var descriptionFilePath = WriteIconDescriptionFile(Path.Combine(descriptionsDirectoryPath, $"{icon.name}.md"), iconPath, icon, fileId);
                    readmeBuilder.Append($"| [<img src=\"{iconPath}\" width={Mathf.Min(icon.width, 48)} height={Mathf.Min(icon.height, 48)} title=\"{icon.name}\">]({descriptionFilePath}) ");

                    if (n >= coloumns - 1)
                    {
                        readmeBuilder.Append("|");
                        readmeBuilder.AppendLine();
                        n = 0;
                    }
                    else
                        n++;
                }
                catch (Exception exception)
                {
                    Debug.LogException(exception);
                }
            }

            readmeBuilder.AppendLine("\n\n\n*Original script author [@halak](https://github.com/halak)*");
            File.WriteAllText(readme, readmeBuilder.ToString());
            
            Debug.Log($"'{readme}' is generated.");
        }
        finally
        {
            EditorUtility.ClearProgressBar();
            AssetDatabase.DeleteAsset(guidMaterialId);
        }
    }

    private static string WriteIconDescriptionFile(string path, string pathToIcon, Texture2D icon, string fileId)
    {
        iconDescriptionBuilder.AppendLine($"# {icon.name} `{icon.width}x{icon.height}`");
        iconDescriptionBuilder.AppendLine($"<img src=\"/{pathToIcon}\" width={Mathf.Min(icon.width, 512)} height={Mathf.Min(icon.height, 512)}>");
        iconDescriptionBuilder.AppendLine();
        iconDescriptionBuilder.AppendLine("``` CSharp");
        iconDescriptionBuilder.AppendLine($"EditorGUIUtility.IconContent(\"{icon.name}\")");
        iconDescriptionBuilder.AppendLine("```");
        iconDescriptionBuilder.AppendLine("```");
        iconDescriptionBuilder.AppendLine(icon.name);
        iconDescriptionBuilder.AppendLine("```");
        iconDescriptionBuilder.AppendLine("```");
        iconDescriptionBuilder.AppendLine(fileId);
        iconDescriptionBuilder.AppendLine("```");
        
        File.WriteAllText(path, iconDescriptionBuilder.ToString());
        
        iconDescriptionBuilder.Clear();

        return path.Replace(" ", "%20").Replace('\\', '/');
    }

    private static IEnumerable<string> EnumerateIcons(AssetBundle editorAssetBundle, string iconsPath)
    {
        foreach (var assetName in editorAssetBundle.GetAllAssetNames())
            if (assetName.StartsWith(iconsPath, StringComparison.OrdinalIgnoreCase) &&
                (assetName.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                 assetName.EndsWith(".asset", StringComparison.OrdinalIgnoreCase)))
                yield return assetName;
    }

    private static string GetFileId(string proxyAssetPath)
    {
        var serializedAsset = File.ReadAllText(proxyAssetPath);
        var index = serializedAsset.IndexOf("_MainTex:", StringComparison.Ordinal);
        
        if (index == -1)
            return string.Empty;

        const string FileId = "fileID:";
        var startIndex = serializedAsset.IndexOf(FileId, index) + FileId.Length;
        var endIndex = serializedAsset.IndexOf(',', startIndex);
        return serializedAsset.Substring(startIndex, endIndex - startIndex).Trim();
    }

    private static AssetBundle GetEditorAssetBundle() => (AssetBundle) typeof(EditorGUIUtility).GetMethod("GetEditorAssetBundle", BindingFlags.NonPublic | BindingFlags.Static)
                                                                                               .Invoke(null, new object[] { });

    private static string GetIconsPath()
    {
#if UNITY_2018_3_OR_NEWER
        return UnityEditor.Experimental.EditorResources.iconsPath;
#else
        var assembly = typeof(EditorGUIUtility).Assembly;
        var editorResourcesUtility = assembly.GetType("UnityEditorInternal.EditorResourcesUtility");
        var iconsPathProperty = editorResourcesUtility.GetProperty(
            "iconsPath",
            BindingFlags.Static | BindingFlags.Public);
        return (string)iconsPathProperty.GetValue(null, new object[] { });
#endif
    }
}
