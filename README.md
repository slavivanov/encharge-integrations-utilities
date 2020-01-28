## Checklist for API definition

The list below should ideally be checked programatically.

Make sure that:

- Property `securitySchemes` MUST be defined in `components`
- Property `security` MUST list the scheme from `securitySchemes`
- A `securitySchemes` schema MIGHT have property `x-encharge-auth-flow-extra-operation`
  which lists the operation to perform after authentication to retrieve
  additional credentials.
- TODO: Document x-encharge-service config. For now, see
  IServiceSchemaEnchargeExtension in "openapiSchema.d.ts".
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

  - `type`: trigger | action | filter | dynamic | subscribe | unsubscribe |
    authentication | events

    The operation Type (**required**). Possible types:

    - `trigger` - operation that starts flows. Can be triggered by webhooks,
      events, or changes in polled endpoints.

    - `action` - operation that makes "things happen". For example, updating
      a person in an external system.

    - `filter` - operation that checks if a person fulfills specific conditions.

    - `dynamic` - operation that retrieves dynamic fields for an entitity (e.g.
      lead).

    - `authentication` - operation that performs part of an authentication
      flows. For example, exchanging short-lived token for a long-lived one.

    - `sync` - operation that is part of 2 way sync functionality.

    - `subscribe` - subscribe suboperation for webhook triggers. Calls an
      external system to send updates about a topic.

    - `unsubscribe` - unsubscribe suboperation for webhook triggers. Calls an
      external system to stop receiving updates about a topic.

    - `events` - suboperation for event triggers. Retrieves a list of the
      event topics that should trigger the operation.

  - `triggerType`: polling | hook | event

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

  - `events`: { type: "operation" | "list", operation?: string, list?: string[]}

    Describes how to set up event listeners for a hook trigger.

    - If `type` is "operation":

      `operation` is the name of the suboperation that will retrieve the event triggers for this
      operation. The operation must return an array of strings, describing event
      triggers.

    - If `type` is "list":

      `list` is an array of strings, describing event triggers. For example:
      "new-user", "deleted-user".

* `producesEndUsers`: boolean

  - Whether this operation outputs end users. If this is false/not set, the results produced won't be mapped to end users.

* `consumesEndUsers`: boolean

  - Whether this operation needs end users. If this is false/not set, end users won't be sent to this step.

* `neededEndUserFields`: string[]

  - List of end user fields that this operation needs if it consumes end users.
    Id fields (`id`, `email`, `userId`, `segmentAnonymousId`) are included by
    default. We should always provide this if possible to reduce the amount of
    data passed around. Format: ["firstName", "address", "nested.field", ...];

* `needsFullEndUsers`: boolean

  - Whether to include the full enduser data with the request. Negates `neededEnduserFields`.

* `linkConditions`: { conditions: { condition: string, label: string }[], multipleConditions?: boolean, registerEventListener: boolean }

  - Types of links that can originate from this operation to other operations, MAY be specified in `linkConditions` as `conditions`.

  - If multiple conditions can be selected at the same time (i.e. conditions are not mutually exclusive) specify `multipleConditions` as true.

  - If an event listener should be registered to activate next steps, specify `registerEventListener` as true.

  - To disable linking from this step (e.g. for end flow), specify `linkFromDisabled` as true.

* `runOnce`: boolean

  - If false the operation will be run once once. Note: this flag is not functioning properly at the moment.

* `idempotent`: boolean

  - If false, the operation can't be safely performed multiple times. By default, this is `true`.

* `batch`: boolean

  - DEPRECIATED: If this operation can handle multiple results/end users at once.

* `getAll`: boolean

  - Considered for depreciation. Whether this operation should run multiple times until it stops producing results.

* `pollAfterGetAll`: boolean

  - Considered for depreciation. Whether this operation should continue polling after getting all the initial results (see `getAll` flag above).

* `batchResultsOnGetAll`: boolean

  - Considered for depreciation. Whether this operation should send the initial results as they are produced, or await until they are all retrieved.

* `waitForPreviousStepCompletion`: boolean

  - Considered for depreciation. Whether this operation should wait for the all tasks of the previous step to complete to start. Use with caution: in a distributed task queue such as ours, this might not work 100% of the cases.

* `skipLiquidTagReplacement`: boolean

  - Should we skip Liquid tag replacement before passing the data to this step. Useful for steps that process liquid tags on their own.

* `mustConfig`: {
  configStep?: boolean;
  mapInputFields?: boolean;
  mapOutputFields?: boolean;
  }

  - Control what the user must configure for this operation to work.

* `alwaysMapOutputFields`: boolean

  - Always ask the user to map the output fields of this operation, even if there appear to be no output fields.

* `alwaysShowInputFields`: boolean

  - Always show the user the input fields of this operation, even if there appear to be no output fields.

* `helpDocs`: { url?: string, markdown?: string}

  - Help docs for the operation. If URL is set, it will be embedded via an iframe. Otherwise the markdown will be rendered.

* `isUserInitiated`: boolean;

  - Whether the user actively performed this step, Used to detect set the last
    time the user was active. Most applicable for triggers.

* `resultsAlreadyMappedToEndUsers`: boolean;

  - Whether this step produces end users. Used mostly to not apply field mapping
    when service field mapping is present.

* `needsServiceFieldMappings`: boolean;

  - Whether this step needs the service field mappings to be sent.

* An operation's field MIGHT include `x-encharge-recipe` object, which describes how the field can be used in a recipe (template). Available `x-encharge-recipe` properties:

  - `resourceType`: segment | email | flow | account | step | field

    - If a resource (segment, email, etc.) has be copied/used along with this input field, specify its type here.

  - `clearValue`: boolean
    - Set to true if the value of the field has to be cleared when the operation is used in a recipe.

* Property `responses` MIGHT be defined in `components`. If it lists a response with key of `default` this response will be used for service-wide response field mapping (as opposed to mapping fields from each individual operation).
