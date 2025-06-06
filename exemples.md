
## json:path

### Evaluate multiple queries from same JSON.

```yaml
steps:
  - action: json:path
    id: json-path
    name: Parse Json files
    input:
      commonParams:
        json:
          key: value
          array:
            - key: 1
            - key: 2
              dictionary:
                a: Apple
                b: Butterfly
                c: Cat
                d: Dog
            - key: 3
      queries:
        - path: $.array[?(@.key==2)].dictionary.a
        - path: $.array[?(@.key==3)]

```

### Evaluate queries from different JSON data.

```yaml
steps:
  - action: json:path
    id: json-path
    name: Parse Json files
    input:
      queries:
        - json:
            key: value
            array:
              - key: 1
              - key: 2
                dictionary:
                  a: Apple
                  b: Butterfly
                  c: Cat
                  d: Dog
              - key: 3
          path: $.array[?(@.key==2)].dictionary.a
        - json:
            key: value
            array:
              - key: 3
          path: $.array[?(@.key==3)]

```


## json

### Parse multiple Json contents from various sources types.

```yaml
steps:
  - action: json
    id: json-parse
    name: Parse Json files
    input:
      commonParams:
        encoding: raw
      sources:
        - content: '{"key":"value"}'

```


## yaml

### Parse multiple Yamls contents from various sources types.

```yaml
steps:
  - action: yaml
    id: yaml-parse
    name: Parse yaml files
    input:
      commonParams:
        encoding: raw
      sources:
        - content: |
            key: value
        - content: |
            anotherkey: another value

```


## xml

### Parse multiple Xmls contents from various sources types.

```yaml
steps:
  - action: xml
    id: xml-parse
    name: Parse xml files
    input:
      commonParams:
        encoding: raw
      sources:
        - content: <books><book>nature calls</book></books>

```
