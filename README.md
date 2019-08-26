# package-installer

## Process
1. Download `azimuth-packages/repository-metadata.json`
2. Check for, and create if necessary `project-root/src/service-references`
    1. `/index.ts`
    2. `/service-metadata.json`
3. Get a list of all installed packages from the `service-metadata.json`
4. Get a list of all available packages and their version from `repository-metadata.json`
5. Display list of packages to install that the user can select one from
    1. Packages installed and with the latest should be green
    2. Packages installed that are behind latest should be yellow
    3. Not installed packages should be default
6. After a user chooses, display the versions to install
    1. Version currently installed should be green
7. After the user chooses, download `azimuth-packages/<package-name>/<version-number>` into local `temp/<package-name>`
8. If exists, remove `project-root/src/service-references/<package-name>`
9. Create `project-root/src/service-references/<package-name>`
10. Move `temp/<package-name>` to `project-root/src/service-references/<package-name>`
11. Update `project-root/src/service-references/index.ts` to include `export * from './<project-name>';`
12. Update `project-root/src/service-references/service-metadata.json` to include the current installation
