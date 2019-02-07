## Checklist for API definition

The list below should ideally be checked programatically.

Make sure that:
1. Property `securitySchemes` MUST be defined
2. Property `security` MUST list the scheme from `securitySchemes`
3. Paths MUST use the followin format: `/operationName`
4. Paths MUST have only a single method, which is `post`.
5. Each operation has `x-encharge-operation` object which MUST contains `type` 
specification. Type MUST be one of: 
`trigger | action | filter | dynamic | subscribe | unsubscribe`
6. Each trigger operation has `triggerType` in `x-encharge-operation`.
TriggerType MUST be one of `polling | hook`
7. Remember that empty JSON schema, i.e. {}, allows for all parameters. 
The proper schema for no parameters is 
`{ "type": "object", "additionalProperties": false } `
8. All requestBody and response MUST use only `application/json` as media type.
9. Hook trigger operations SHOULD include references to subscribe 
and unsubscribe operations in `x-encharge-operation` object
(properties are named `subscribe` and `unsubscribe`). This is not currently
used, but should be very soon. Until the above is implemented, subcribe and
unsubscribe operations SHOULD follow the following naming convention:
`/operationName/subscribe` and `/operationName/unsubscribe` where 
`/operationName` is the name of the main hook trigger operation.
10. Hook trigger operation MUST have the same request body as the 
corresponding subscribe operation. To minimize errors, this SHOULD be 
implemented via internal references. For example here is the requestBody schema
for "/entries": 
`"$ref": "#/paths/~1entries~1subscribe/post/requestBody/content/application~1json/schema"`
11. Operations related to a given operation, should be specified as 
subresources. For example, `/forms/dynamic-output-fields`
12. Request body and response schema MAY be specified via an external reference
(e.g `"$ref": "entries/output.json"`). This reference MAY be a JSON schema.
13. Types of links that can originate from this operation to other operations,
MAY be specified in `x-encharge-operation` as `linkConditions`, which is an 
array of { condition: string, label: string }.