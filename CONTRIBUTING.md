
## Fast Development

```sh
git submodule add git@github.com:kode3tech/k3t-backstage-plugin-scaffolder-backend-module-parsings.git plugins/scaffolder-backend-module-parsings
```


`packages/backend/package.json`

```json
  "dependencies": {
    ...
    "@k3tech/backstage-plugin-scaffolder-backend-module-parsings": "link:../../plugins/scaffolder-backend-module-parsings",
  }
```

## Publishing

```sh

yarn login

yarn examples && yarn release:full && yarn && yarn tsc && yarn build &&  yarn pack && yarn publish --non-interactive

```
