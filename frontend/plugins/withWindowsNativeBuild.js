/* Acorta las rutas de compilación nativa en Windows. */
const { withProjectBuildGradle } = require("expo/config-plugins");

const begin = "// @generated begin lupita-windows-native-build";
const end = "// @generated end lupita-windows-native-build";

module.exports = function withWindowsNativeBuild(config) {
  return withProjectBuildGradle(config, (result) => {
    const block = `
${begin}
if (System.getProperty("os.name").toLowerCase().contains("windows")) {
    def configuredRoot = System.getenv("LUPITA_NATIVE_BUILD_ROOT")
    def cacheRoot = configuredRoot
        ? new File(configuredRoot)
        : new File(rootDir.toPath().getRoot().toFile(), ".lupita-cxx")
    def projectCache = new File(cacheRoot, Integer.toHexString(rootDir.absolutePath.hashCode()))
    subprojects { nativeProject ->
        nativeProject.afterEvaluate {
            def androidExtension = nativeProject.extensions.findByName("android")
            if (androidExtension != null &&
                (nativeProject.name == "app" || androidExtension.externalNativeBuild.cmake.path != null)) {
                androidExtension.externalNativeBuild.cmake.buildStagingDirectory =
                    new File(projectCache, nativeProject.name)
                def cmakeArguments = androidExtension.defaultConfig.externalNativeBuild.cmake.arguments
                cmakeArguments.removeAll { it.startsWith("-DCMAKE_OBJECT_PATH_MAX=") }
                cmakeArguments.add("-DCMAKE_OBJECT_PATH_MAX=240")
            }
        }
    }
}
${end}`;
    const contents = result.modResults.contents;
    const start = contents.indexOf(begin);
    const finish = contents.indexOf(end);
    const clean = start >= 0 && finish >= start
      ? contents.slice(0, start) + contents.slice(finish + end.length)
      : contents;
    const anchor = 'apply plugin: "expo-root-project"';
    if (!clean.includes(anchor)) throw new Error("No se encontró el plugin raíz de Expo en Android.");
    result.modResults.contents = clean.replace(anchor, block + "\n\n" + anchor);
    return result;
  });
};
