## Checklist for API definition

The list below should ideally be checked programatically.

Make sure that:

- Property `securitySchemes` MUST be defined
- Property `security` MUST list the scheme from `securitySchemes`
- Paths MUST use the following format: `/operationName`
- Paths MUST have only a single method, which is `post`.
- Each operation has `x-encharge-operation` object.
- Remember that empty JSON schema, i.e. {}, allows for all parameters.
  The proper schema for no parameters is
  `{ "type": "object", "additionalProperties": false }`
- All requestBody and response MUST use only `application/json` as media type.
- Operations related to a given operation, should be specified as
  subresources. For example, `/forms/dynamic-output-fields`
- Request body and response schema MAY be specified via an external reference
  (e.g `"$ref": "entries/output.json"`). This reference MAY be a JSON schema.
- Available `x-encharge-operation` flags:

  - `type`: trigger | action | filter | dynamic | subscribe | unsubscribe

    - The operation Type (**required**)

  - `triggerType`: polling | hook

    - The type of trigger (required for trigger operations)

  - `subscribe`: string

    - Name of the subscribe suboperation for this operation. E.g. `/form/subscribe`. Applies to hook triggers.

    Hook trigger operations SHOULD include references to subscribe
    and unsubscribe operations in `x-encharge-operation` object
    (properties are named `subscribe` and `unsubscribe`). This is not currently
    used, but should be very soon. Until the above is implemented, subcribe and
    unsubscribe operations SHOULD follow the following naming convention:
    `/operationName/subscribe` and `/operationName/unsubscribe` where
    `/operationName` is the name of the main hook trigger operation.

    Hook trigger operation MUST have the same request body as the
    corresponding subscribe operation. To minimize errors, this SHOULD be
    implemented via internal references. For example here is the requestBody schema
    for "/entries":
    `"$ref": "#/paths/~1entries~1subscribe/post/requestBody/content/application~1json/schema"`

  - `unsubscribe`: string

    - Name of the subscribe suboperation for this operation. E.g. `/form/subscribe`. Applies to hook triggers.

  - `producesEndUsers`: boolean

    - Whether this operation outputs end users. If this is false/not set, the results produced won't be mapped to end users.

  - `consumesEndUsers`: boolean

    - Whether this operation needs end users. If this is false/not set, end users won't be sent to this step.

  - `neededEndUserFields`: string[]

    - List of end user fields that this operation needs if it consumes end users. Id fields (`id`, `email`, `userId`, `segmentAnonymousId`) are included by default. We should always provide this if possible to reduce the amount of data passed around. Format: ["firstName", "address", ...];

  - `linkConditions`: { conditions: { condition: string, label: string }[], multipleConditions?: boolean, registerEventListener: boolean }

    - Types of links that can originate from this operation to other operations, MAY be specified in `linkConditions` as `conditions`.

    - If multiple conditions can be selected at the same time (i.e. conditions are not mutually exclusive) specify `multipleConditions` as true.

    - If an event listener should be registered to activate next steps, specify `registerEventListener` as true.

  - `runOnce`: boolean

    - If false the operation will be run once once.

  - `batch`: boolean

    - If this operation can handle multiple results/end users at once.

  - `getAll`: boolean

    - Whether this operation should run multiple times until it stops producing results.

  - `pollAfterGetAll`: boolean

    - Whether this operation should continue polling after getting all the initial results (see `getAll` flag above).

  - `batchResultsOnGetAll`: boolean

    - Whether this operation should send the initial results as they are produced, or await until they are all retrieved.

  - `waitForPreviousStepCompletion`: boolean

    - Whether this operation should wait for the all tasks of the previous step to complete to start. Use with caution: in a distributed task queue such as ours, this might not work 100% of the cases.

  - `removeMissingCurlies`: boolean

    - Should we prune missing curlies or not. Useful for steps that process liquid tags. More complex liquid tags are bound to be removed without this.

  - `mustConfig`: {
    configStep?: boolean;
    mapInputFields?: boolean;
    mapOutputFields?: boolean;
    }
    - Control what the user must configure for this operation to work.

- An operation's field MIGHT include `x-encharge-recipe` object, which describes how the field can be used in a recipe (template). Available `x-encharge-recipe` properties:

  - `resourceType`: segment | email | flow | account | step | field

    - If a resource (segment, email, etc.) has be copied/used along with this input field, specify its type here.

  - `clearValue`: boolean
    - Set to true if the value of the field has to be cleared when the operation is used in a recipe.
