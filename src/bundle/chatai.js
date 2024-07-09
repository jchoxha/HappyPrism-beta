var __getOwnPropNames = Object.getOwnPropertyNames;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@google/generative-ai/dist/index.js
var require_dist = __commonJS({
  "node_modules/@google/generative-ai/dist/index.js"(exports) {
    "use strict";
    var POSSIBLE_ROLES = ["user", "model", "function", "system"];
    exports.HarmCategory = void 0;
    (function(HarmCategory) {
      HarmCategory["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
      HarmCategory["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
      HarmCategory["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
      HarmCategory["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
      HarmCategory["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
    })(exports.HarmCategory || (exports.HarmCategory = {}));
    exports.HarmBlockThreshold = void 0;
    (function(HarmBlockThreshold) {
      HarmBlockThreshold["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
      HarmBlockThreshold["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
      HarmBlockThreshold["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
      HarmBlockThreshold["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
      HarmBlockThreshold["BLOCK_NONE"] = "BLOCK_NONE";
    })(exports.HarmBlockThreshold || (exports.HarmBlockThreshold = {}));
    exports.HarmProbability = void 0;
    (function(HarmProbability) {
      HarmProbability["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
      HarmProbability["NEGLIGIBLE"] = "NEGLIGIBLE";
      HarmProbability["LOW"] = "LOW";
      HarmProbability["MEDIUM"] = "MEDIUM";
      HarmProbability["HIGH"] = "HIGH";
    })(exports.HarmProbability || (exports.HarmProbability = {}));
    exports.BlockReason = void 0;
    (function(BlockReason) {
      BlockReason["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
      BlockReason["SAFETY"] = "SAFETY";
      BlockReason["OTHER"] = "OTHER";
    })(exports.BlockReason || (exports.BlockReason = {}));
    exports.FinishReason = void 0;
    (function(FinishReason) {
      FinishReason["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
      FinishReason["STOP"] = "STOP";
      FinishReason["MAX_TOKENS"] = "MAX_TOKENS";
      FinishReason["SAFETY"] = "SAFETY";
      FinishReason["RECITATION"] = "RECITATION";
      FinishReason["OTHER"] = "OTHER";
    })(exports.FinishReason || (exports.FinishReason = {}));
    exports.TaskType = void 0;
    (function(TaskType) {
      TaskType["TASK_TYPE_UNSPECIFIED"] = "TASK_TYPE_UNSPECIFIED";
      TaskType["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
      TaskType["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
      TaskType["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
      TaskType["CLASSIFICATION"] = "CLASSIFICATION";
      TaskType["CLUSTERING"] = "CLUSTERING";
    })(exports.TaskType || (exports.TaskType = {}));
    exports.FunctionCallingMode = void 0;
    (function(FunctionCallingMode) {
      FunctionCallingMode["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
      FunctionCallingMode["AUTO"] = "AUTO";
      FunctionCallingMode["ANY"] = "ANY";
      FunctionCallingMode["NONE"] = "NONE";
    })(exports.FunctionCallingMode || (exports.FunctionCallingMode = {}));
    exports.FunctionDeclarationSchemaType = void 0;
    (function(FunctionDeclarationSchemaType) {
      FunctionDeclarationSchemaType["STRING"] = "STRING";
      FunctionDeclarationSchemaType["NUMBER"] = "NUMBER";
      FunctionDeclarationSchemaType["INTEGER"] = "INTEGER";
      FunctionDeclarationSchemaType["BOOLEAN"] = "BOOLEAN";
      FunctionDeclarationSchemaType["ARRAY"] = "ARRAY";
      FunctionDeclarationSchemaType["OBJECT"] = "OBJECT";
    })(exports.FunctionDeclarationSchemaType || (exports.FunctionDeclarationSchemaType = {}));
    var GoogleGenerativeAIError = class extends Error {
      constructor(message) {
        super(`[GoogleGenerativeAI Error]: ${message}`);
      }
    };
    var GoogleGenerativeAIResponseError = class extends GoogleGenerativeAIError {
      constructor(message, response) {
        super(message);
        this.response = response;
      }
    };
    var GoogleGenerativeAIFetchError = class extends GoogleGenerativeAIError {
      constructor(message, status, statusText, errorDetails) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.errorDetails = errorDetails;
      }
    };
    var GoogleGenerativeAIRequestInputError = class extends GoogleGenerativeAIError {
    };
    var DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
    var DEFAULT_API_VERSION = "v1beta";
    var PACKAGE_VERSION = "0.12.0";
    var PACKAGE_LOG_HEADER = "genai-js";
    var Task;
    (function(Task2) {
      Task2["GENERATE_CONTENT"] = "generateContent";
      Task2["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
      Task2["COUNT_TOKENS"] = "countTokens";
      Task2["EMBED_CONTENT"] = "embedContent";
      Task2["BATCH_EMBED_CONTENTS"] = "batchEmbedContents";
    })(Task || (Task = {}));
    var RequestUrl = class {
      constructor(model, task, apiKey, stream, requestOptions) {
        this.model = model;
        this.task = task;
        this.apiKey = apiKey;
        this.stream = stream;
        this.requestOptions = requestOptions;
      }
      toString() {
        var _a, _b;
        const apiVersion = ((_a = this.requestOptions) === null || _a === void 0 ? void 0 : _a.apiVersion) || DEFAULT_API_VERSION;
        const baseUrl = ((_b = this.requestOptions) === null || _b === void 0 ? void 0 : _b.baseUrl) || DEFAULT_BASE_URL;
        let url = `${baseUrl}/${apiVersion}/${this.model}:${this.task}`;
        if (this.stream) {
          url += "?alt=sse";
        }
        return url;
      }
    };
    function getClientHeaders(requestOptions) {
      const clientHeaders = [];
      if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.apiClient) {
        clientHeaders.push(requestOptions.apiClient);
      }
      clientHeaders.push(`${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`);
      return clientHeaders.join(" ");
    }
    async function getHeaders(url) {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
      headers.append("x-goog-api-key", url.apiKey);
      let customHeaders = url.requestOptions.customHeaders;
      if (customHeaders) {
        if (!(customHeaders instanceof Headers)) {
          try {
            customHeaders = new Headers(customHeaders);
          } catch (e) {
            throw new GoogleGenerativeAIRequestInputError(`unable to convert customHeaders value ${JSON.stringify(customHeaders)} to Headers: ${e.message}`);
          }
        }
        for (const [headerName, headerValue] of customHeaders.entries()) {
          if (headerName === "x-goog-api-key") {
            throw new GoogleGenerativeAIRequestInputError(`Cannot set reserved header name ${headerName}`);
          } else if (headerName === "x-goog-api-client") {
            throw new GoogleGenerativeAIRequestInputError(`Header name ${headerName} can only be set using the apiClient field`);
          }
          headers.append(headerName, headerValue);
        }
      }
      return headers;
    }
    async function constructRequest(model, task, apiKey, stream, body, requestOptions) {
      const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
      return {
        url: url.toString(),
        fetchOptions: Object.assign(Object.assign({}, buildFetchOptions(requestOptions)), { method: "POST", headers: await getHeaders(url), body })
      };
    }
    async function makeRequest(model, task, apiKey, stream, body, requestOptions) {
      return _makeRequestInternal(model, task, apiKey, stream, body, requestOptions, fetch);
    }
    async function _makeRequestInternal(model, task, apiKey, stream, body, requestOptions, fetchFn = fetch) {
      const url = new RequestUrl(model, task, apiKey, stream, requestOptions);
      let response;
      try {
        const request = await constructRequest(model, task, apiKey, stream, body, requestOptions);
        response = await fetchFn(request.url, request.fetchOptions);
        if (!response.ok) {
          let message = "";
          let errorDetails;
          try {
            const json = await response.json();
            message = json.error.message;
            if (json.error.details) {
              message += ` ${JSON.stringify(json.error.details)}`;
              errorDetails = json.error.details;
            }
          } catch (e) {
          }
          throw new GoogleGenerativeAIFetchError(`Error fetching from ${url.toString()}: [${response.status} ${response.statusText}] ${message}`, response.status, response.statusText, errorDetails);
        }
      } catch (e) {
        let err = e;
        if (!(e instanceof GoogleGenerativeAIFetchError || e instanceof GoogleGenerativeAIRequestInputError)) {
          err = new GoogleGenerativeAIError(`Error fetching from ${url.toString()}: ${e.message}`);
          err.stack = e.stack;
        }
        throw err;
      }
      return response;
    }
    function buildFetchOptions(requestOptions) {
      const fetchOptions = {};
      if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
        const abortController = new AbortController();
        const signal = abortController.signal;
        setTimeout(() => abortController.abort(), requestOptions.timeout);
        fetchOptions.signal = signal;
      }
      return fetchOptions;
    }
    function addHelpers(response) {
      response.text = () => {
        if (response.candidates && response.candidates.length > 0) {
          if (response.candidates.length > 1) {
            console.warn(`This response had ${response.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`);
          }
          if (hadBadFinishReason(response.candidates[0])) {
            throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
          }
          return getText(response);
        } else if (response.promptFeedback) {
          throw new GoogleGenerativeAIResponseError(`Text not available. ${formatBlockErrorMessage(response)}`, response);
        }
        return "";
      };
      response.functionCall = () => {
        if (response.candidates && response.candidates.length > 0) {
          if (response.candidates.length > 1) {
            console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
          }
          if (hadBadFinishReason(response.candidates[0])) {
            throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
          }
          console.warn(`response.functionCall() is deprecated. Use response.functionCalls() instead.`);
          return getFunctionCalls(response)[0];
        } else if (response.promptFeedback) {
          throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
        }
        return void 0;
      };
      response.functionCalls = () => {
        if (response.candidates && response.candidates.length > 0) {
          if (response.candidates.length > 1) {
            console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
          }
          if (hadBadFinishReason(response.candidates[0])) {
            throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
          }
          return getFunctionCalls(response);
        } else if (response.promptFeedback) {
          throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
        }
        return void 0;
      };
      return response;
    }
    function getText(response) {
      var _a, _b, _c, _d;
      const textStrings = [];
      if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
        for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
          if (part.text) {
            textStrings.push(part.text);
          }
        }
      }
      if (textStrings.length > 0) {
        return textStrings.join("");
      } else {
        return "";
      }
    }
    function getFunctionCalls(response) {
      var _a, _b, _c, _d;
      const functionCalls = [];
      if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
        for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
          if (part.functionCall) {
            functionCalls.push(part.functionCall);
          }
        }
      }
      if (functionCalls.length > 0) {
        return functionCalls;
      } else {
        return void 0;
      }
    }
    var badFinishReasons = [exports.FinishReason.RECITATION, exports.FinishReason.SAFETY];
    function hadBadFinishReason(candidate) {
      return !!candidate.finishReason && badFinishReasons.includes(candidate.finishReason);
    }
    function formatBlockErrorMessage(response) {
      var _a, _b, _c;
      let message = "";
      if ((!response.candidates || response.candidates.length === 0) && response.promptFeedback) {
        message += "Response was blocked";
        if ((_a = response.promptFeedback) === null || _a === void 0 ? void 0 : _a.blockReason) {
          message += ` due to ${response.promptFeedback.blockReason}`;
        }
        if ((_b = response.promptFeedback) === null || _b === void 0 ? void 0 : _b.blockReasonMessage) {
          message += `: ${response.promptFeedback.blockReasonMessage}`;
        }
      } else if ((_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0]) {
        const firstCandidate = response.candidates[0];
        if (hadBadFinishReason(firstCandidate)) {
          message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
          if (firstCandidate.finishMessage) {
            message += `: ${firstCandidate.finishMessage}`;
          }
        }
      }
      return message;
    }
    function __await(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function verb(n) {
        if (g[n]) i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
      }
    }
    var responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
    function processStream(response) {
      const inputStream = response.body.pipeThrough(new TextDecoderStream("utf8", { fatal: true }));
      const responseStream = getResponseStream(inputStream);
      const [stream1, stream2] = responseStream.tee();
      return {
        stream: generateResponseSequence(stream1),
        response: getResponsePromise(stream2)
      };
    }
    async function getResponsePromise(stream) {
      const allResponses = [];
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return addHelpers(aggregateResponses(allResponses));
        }
        allResponses.push(value);
      }
    }
    function generateResponseSequence(stream) {
      return __asyncGenerator(this, arguments, function* generateResponseSequence_1() {
        const reader = stream.getReader();
        while (true) {
          const { value, done } = yield __await(reader.read());
          if (done) {
            break;
          }
          yield yield __await(addHelpers(value));
        }
      });
    }
    function getResponseStream(inputStream) {
      const reader = inputStream.getReader();
      const stream = new ReadableStream({
        start(controller) {
          let currentText = "";
          return pump();
          function pump() {
            return reader.read().then(({ value, done }) => {
              if (done) {
                if (currentText.trim()) {
                  controller.error(new GoogleGenerativeAIError("Failed to parse stream"));
                  return;
                }
                controller.close();
                return;
              }
              currentText += value;
              let match = currentText.match(responseLineRE);
              let parsedResponse;
              while (match) {
                try {
                  parsedResponse = JSON.parse(match[1]);
                } catch (e) {
                  controller.error(new GoogleGenerativeAIError(`Error parsing JSON response: "${match[1]}"`));
                  return;
                }
                controller.enqueue(parsedResponse);
                currentText = currentText.substring(match[0].length);
                match = currentText.match(responseLineRE);
              }
              return pump();
            });
          }
        }
      });
      return stream;
    }
    function aggregateResponses(responses) {
      const lastResponse = responses[responses.length - 1];
      const aggregatedResponse = {
        promptFeedback: lastResponse === null || lastResponse === void 0 ? void 0 : lastResponse.promptFeedback
      };
      for (const response of responses) {
        if (response.candidates) {
          for (const candidate of response.candidates) {
            const i = candidate.index;
            if (!aggregatedResponse.candidates) {
              aggregatedResponse.candidates = [];
            }
            if (!aggregatedResponse.candidates[i]) {
              aggregatedResponse.candidates[i] = {
                index: candidate.index
              };
            }
            aggregatedResponse.candidates[i].citationMetadata = candidate.citationMetadata;
            aggregatedResponse.candidates[i].finishReason = candidate.finishReason;
            aggregatedResponse.candidates[i].finishMessage = candidate.finishMessage;
            aggregatedResponse.candidates[i].safetyRatings = candidate.safetyRatings;
            if (candidate.content && candidate.content.parts) {
              if (!aggregatedResponse.candidates[i].content) {
                aggregatedResponse.candidates[i].content = {
                  role: candidate.content.role || "user",
                  parts: []
                };
              }
              const newPart = {};
              for (const part of candidate.content.parts) {
                if (part.text) {
                  newPart.text = part.text;
                }
                if (part.functionCall) {
                  newPart.functionCall = part.functionCall;
                }
                if (Object.keys(newPart).length === 0) {
                  newPart.text = "";
                }
                aggregatedResponse.candidates[i].content.parts.push(newPart);
              }
            }
          }
        }
      }
      return aggregatedResponse;
    }
    async function generateContentStream(apiKey, model, params, requestOptions) {
      const response = await makeRequest(
        model,
        Task.STREAM_GENERATE_CONTENT,
        apiKey,
        /* stream */
        true,
        JSON.stringify(params),
        requestOptions
      );
      return processStream(response);
    }
    async function generateContent(apiKey, model, params, requestOptions) {
      const response = await makeRequest(
        model,
        Task.GENERATE_CONTENT,
        apiKey,
        /* stream */
        false,
        JSON.stringify(params),
        requestOptions
      );
      const responseJson = await response.json();
      const enhancedResponse = addHelpers(responseJson);
      return {
        response: enhancedResponse
      };
    }
    function formatSystemInstruction(input) {
      if (input == null) {
        return void 0;
      } else if (typeof input === "string") {
        return { role: "system", parts: [{ text: input }] };
      } else if (input.text) {
        return { role: "system", parts: [input] };
      } else if (input.parts) {
        if (!input.role) {
          return { role: "system", parts: input.parts };
        } else {
          return input;
        }
      }
    }
    function formatNewContent(request) {
      let newParts = [];
      if (typeof request === "string") {
        newParts = [{ text: request }];
      } else {
        for (const partOrString of request) {
          if (typeof partOrString === "string") {
            newParts.push({ text: partOrString });
          } else {
            newParts.push(partOrString);
          }
        }
      }
      return assignRoleToPartsAndValidateSendMessageRequest(newParts);
    }
    function assignRoleToPartsAndValidateSendMessageRequest(parts) {
      const userContent = { role: "user", parts: [] };
      const functionContent = { role: "function", parts: [] };
      let hasUserContent = false;
      let hasFunctionContent = false;
      for (const part of parts) {
        if ("functionResponse" in part) {
          functionContent.parts.push(part);
          hasFunctionContent = true;
        } else {
          userContent.parts.push(part);
          hasUserContent = true;
        }
      }
      if (hasUserContent && hasFunctionContent) {
        throw new GoogleGenerativeAIError("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");
      }
      if (!hasUserContent && !hasFunctionContent) {
        throw new GoogleGenerativeAIError("No content is provided for sending chat message.");
      }
      if (hasUserContent) {
        return userContent;
      }
      return functionContent;
    }
    function formatGenerateContentInput(params) {
      let formattedRequest;
      if (params.contents) {
        formattedRequest = params;
      } else {
        const content = formatNewContent(params);
        formattedRequest = { contents: [content] };
      }
      if (params.systemInstruction) {
        formattedRequest.systemInstruction = formatSystemInstruction(params.systemInstruction);
      }
      return formattedRequest;
    }
    function formatEmbedContentInput(params) {
      if (typeof params === "string" || Array.isArray(params)) {
        const content = formatNewContent(params);
        return { content };
      }
      return params;
    }
    var VALID_PART_FIELDS = [
      "text",
      "inlineData",
      "functionCall",
      "functionResponse"
    ];
    var VALID_PARTS_PER_ROLE = {
      user: ["text", "inlineData"],
      function: ["functionResponse"],
      model: ["text", "functionCall"],
      // System instructions shouldn't be in history anyway.
      system: ["text"]
    };
    function validateChatHistory(history) {
      let prevContent = false;
      for (const currContent of history) {
        const { role, parts } = currContent;
        if (!prevContent && role !== "user") {
          throw new GoogleGenerativeAIError(`First content should be with role 'user', got ${role}`);
        }
        if (!POSSIBLE_ROLES.includes(role)) {
          throw new GoogleGenerativeAIError(`Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(POSSIBLE_ROLES)}`);
        }
        if (!Array.isArray(parts)) {
          throw new GoogleGenerativeAIError("Content should have 'parts' property with an array of Parts");
        }
        if (parts.length === 0) {
          throw new GoogleGenerativeAIError("Each Content should have at least one part");
        }
        const countFields = {
          text: 0,
          inlineData: 0,
          functionCall: 0,
          functionResponse: 0,
          fileData: 0
        };
        for (const part of parts) {
          for (const key of VALID_PART_FIELDS) {
            if (key in part) {
              countFields[key] += 1;
            }
          }
        }
        const validParts = VALID_PARTS_PER_ROLE[role];
        for (const key of VALID_PART_FIELDS) {
          if (!validParts.includes(key) && countFields[key] > 0) {
            throw new GoogleGenerativeAIError(`Content with role '${role}' can't contain '${key}' part`);
          }
        }
        prevContent = true;
      }
    }
    var SILENT_ERROR = "SILENT_ERROR";
    var ChatSession = class {
      constructor(apiKey, model, params, requestOptions) {
        this.model = model;
        this.params = params;
        this.requestOptions = requestOptions;
        this._history = [];
        this._sendPromise = Promise.resolve();
        this._apiKey = apiKey;
        if (params === null || params === void 0 ? void 0 : params.history) {
          validateChatHistory(params.history);
          this._history = params.history;
        }
      }
      /**
       * Gets the chat history so far. Blocked prompts are not added to history.
       * Blocked candidates are not added to history, nor are the prompts that
       * generated them.
       */
      async getHistory() {
        await this._sendPromise;
        return this._history;
      }
      /**
       * Sends a chat message and receives a non-streaming
       * {@link GenerateContentResult}
       */
      async sendMessage(request) {
        var _a, _b, _c, _d, _e;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
          safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
          generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
          tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
          toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
          systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
          contents: [...this._history, newContent]
        };
        let finalResult;
        this._sendPromise = this._sendPromise.then(() => generateContent(this._apiKey, this.model, generateContentRequest, this.requestOptions)).then((result) => {
          var _a2;
          if (result.response.candidates && result.response.candidates.length > 0) {
            this._history.push(newContent);
            const responseContent = Object.assign({
              parts: [],
              // Response seems to come back without a role set.
              role: "model"
            }, (_a2 = result.response.candidates) === null || _a2 === void 0 ? void 0 : _a2[0].content);
            this._history.push(responseContent);
          } else {
            const blockErrorMessage = formatBlockErrorMessage(result.response);
            if (blockErrorMessage) {
              console.warn(`sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
          }
          finalResult = result;
        });
        await this._sendPromise;
        return finalResult;
      }
      /**
       * Sends a chat message and receives the response as a
       * {@link GenerateContentStreamResult} containing an iterable stream
       * and a response promise.
       */
      async sendMessageStream(request) {
        var _a, _b, _c, _d, _e;
        await this._sendPromise;
        const newContent = formatNewContent(request);
        const generateContentRequest = {
          safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
          generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
          tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
          toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
          systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
          contents: [...this._history, newContent]
        };
        const streamPromise = generateContentStream(this._apiKey, this.model, generateContentRequest, this.requestOptions);
        this._sendPromise = this._sendPromise.then(() => streamPromise).catch((_ignored) => {
          throw new Error(SILENT_ERROR);
        }).then((streamResult) => streamResult.response).then((response) => {
          if (response.candidates && response.candidates.length > 0) {
            this._history.push(newContent);
            const responseContent = Object.assign({}, response.candidates[0].content);
            if (!responseContent.role) {
              responseContent.role = "model";
            }
            this._history.push(responseContent);
          } else {
            const blockErrorMessage = formatBlockErrorMessage(response);
            if (blockErrorMessage) {
              console.warn(`sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
            }
          }
        }).catch((e) => {
          if (e.message !== SILENT_ERROR) {
            console.error(e);
          }
        });
        return streamPromise;
      }
    };
    async function countTokens(apiKey, model, params, requestOptions) {
      const response = await makeRequest(model, Task.COUNT_TOKENS, apiKey, false, JSON.stringify(Object.assign(Object.assign({}, params), { model })), requestOptions);
      return response.json();
    }
    async function embedContent(apiKey, model, params, requestOptions) {
      const response = await makeRequest(model, Task.EMBED_CONTENT, apiKey, false, JSON.stringify(params), requestOptions);
      return response.json();
    }
    async function batchEmbedContents(apiKey, model, params, requestOptions) {
      const requestsWithModel = params.requests.map((request) => {
        return Object.assign(Object.assign({}, request), { model });
      });
      const response = await makeRequest(model, Task.BATCH_EMBED_CONTENTS, apiKey, false, JSON.stringify({ requests: requestsWithModel }), requestOptions);
      return response.json();
    }
    var GenerativeModel = class {
      constructor(apiKey, modelParams, requestOptions) {
        this.apiKey = apiKey;
        if (modelParams.model.includes("/")) {
          this.model = modelParams.model;
        } else {
          this.model = `models/${modelParams.model}`;
        }
        this.generationConfig = modelParams.generationConfig || {};
        this.safetySettings = modelParams.safetySettings || [];
        this.tools = modelParams.tools;
        this.toolConfig = modelParams.toolConfig;
        this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
        this.requestOptions = requestOptions || {};
      }
      /**
       * Makes a single non-streaming call to the model
       * and returns an object containing a single {@link GenerateContentResponse}.
       */
      async generateContent(request) {
        const formattedParams = formatGenerateContentInput(request);
        return generateContent(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction }, formattedParams), this.requestOptions);
      }
      /**
       * Makes a single streaming call to the model
       * and returns an object containing an iterable stream that iterates
       * over all chunks in the streaming response as well as
       * a promise that returns the final aggregated response.
       */
      async generateContentStream(request) {
        const formattedParams = formatGenerateContentInput(request);
        return generateContentStream(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction }, formattedParams), this.requestOptions);
      }
      /**
       * Gets a new {@link ChatSession} instance which can be used for
       * multi-turn chats.
       */
      startChat(startChatParams) {
        return new ChatSession(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction }, startChatParams), this.requestOptions);
      }
      /**
       * Counts the tokens in the provided request.
       */
      async countTokens(request) {
        const formattedParams = formatGenerateContentInput(request);
        return countTokens(this.apiKey, this.model, formattedParams, this.requestOptions);
      }
      /**
       * Embeds the provided content.
       */
      async embedContent(request) {
        const formattedParams = formatEmbedContentInput(request);
        return embedContent(this.apiKey, this.model, formattedParams, this.requestOptions);
      }
      /**
       * Embeds an array of {@link EmbedContentRequest}s.
       */
      async batchEmbedContents(batchEmbedContentRequest) {
        return batchEmbedContents(this.apiKey, this.model, batchEmbedContentRequest, this.requestOptions);
      }
    };
    var GoogleGenerativeAI = class {
      constructor(apiKey) {
        this.apiKey = apiKey;
      }
      /**
       * Gets a {@link GenerativeModel} instance for the provided model name.
       */
      getGenerativeModel(modelParams, requestOptions) {
        if (!modelParams.model) {
          throw new GoogleGenerativeAIError(`Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })`);
        }
        return new GenerativeModel(this.apiKey, modelParams, requestOptions);
      }
    };
    exports.ChatSession = ChatSession;
    exports.GenerativeModel = GenerativeModel;
    exports.GoogleGenerativeAI = GoogleGenerativeAI;
    exports.GoogleGenerativeAIError = GoogleGenerativeAIError;
    exports.GoogleGenerativeAIFetchError = GoogleGenerativeAIFetchError;
    exports.GoogleGenerativeAIRequestInputError = GoogleGenerativeAIRequestInputError;
    exports.GoogleGenerativeAIResponseError = GoogleGenerativeAIResponseError;
    exports.POSSIBLE_ROLES = POSSIBLE_ROLES;
  }
});

// node_modules/sentiment/lib/tokenize.js
var require_tokenize = __commonJS({
  "node_modules/sentiment/lib/tokenize.js"(exports, module) {
    module.exports = function(input) {
      return input.toLowerCase().replace(/\n/g, " ").replace(/[.,\/#!?$%\^&\*;:{}=_`\"~()]/g, " ").replace(/\s\s+/g, " ").trim().split(" ");
    };
  }
});

// require("../languages/**/*/index") in node_modules/sentiment/lib/language-processor.js
var globRequire_languages_index;
var init_ = __esm({
  'require("../languages/**/*/index") in node_modules/sentiment/lib/language-processor.js'() {
    globRequire_languages_index = __glob({});
  }
});

// node_modules/sentiment/build/emoji.json
var require_emoji = __commonJS({
  "node_modules/sentiment/build/emoji.json"(exports, module) {
    module.exports = {
      "\u{1F602}": 1,
      "\u2764": 3,
      "\u2665": 3,
      "\u{1F60D}": 3,
      "\u{1F62D}": -1,
      "\u{1F618}": 3,
      "\u{1F60A}": 3,
      "\u{1F44C}": 2,
      "\u{1F495}": 3,
      "\u{1F44F}": 2,
      "\u{1F601}": 2,
      "\u263A": 3,
      "\u2661": 3,
      "\u{1F44D}": 2,
      "\u{1F629}": -2,
      "\u{1F64F}": 2,
      "\u270C": 2,
      "\u{1F60F}": 1,
      "\u{1F609}": 2,
      "\u{1F64C}": 2,
      "\u{1F648}": 2,
      "\u{1F4AA}": 2,
      "\u{1F604}": 2,
      "\u{1F612}": -2,
      "\u{1F483}": 3,
      "\u{1F496}": 3,
      "\u{1F603}": 2,
      "\u{1F614}": -1,
      "\u{1F389}": 3,
      "\u{1F61C}": 2,
      "\u{1F338}": 3,
      "\u{1F49C}": 3,
      "\u{1F499}": 3,
      "\u2728": 1,
      "\u{1F497}": 3,
      "\u2605": 1,
      "\u2588": -1,
      "\u2600": 2,
      "\u{1F621}": -1,
      "\u{1F60E}": 2,
      "\u{1F48B}": 3,
      "\u{1F60B}": 3,
      "\u{1F64A}": 2,
      "\u{1F634}": -1,
      "\u{1F3B6}": 2,
      "\u{1F49E}": 3,
      "\u{1F60C}": 2,
      "\u{1F52B}": -1,
      "\u{1F49B}": 3,
      "\u{1F481}": 1,
      "\u{1F49A}": 3,
      "\u266B": 1,
      "\u{1F61E}": -1,
      "\u{1F606}": 2,
      "\u{1F61D}": 2,
      "\u{1F62A}": -1,
      "\u{1F62B}": -1,
      "\u{1F44A}": 1,
      "\u{1F480}": -2,
      "\u{1F600}": 2,
      "\u{1F61A}": 3,
      "\u{1F63B}": 3,
      "\u{1F498}": 3,
      "\u2615": 1,
      "\u{1F44B}": 2,
      "\u{1F38A}": 3,
      "\u{1F355}": 2,
      "\u2744": 2,
      "\u{1F615}": -2,
      "\u{1F494}": -1,
      "\u{1F624}": -2,
      "\u{1F608}": 1,
      "\u2708": 2,
      "\u{1F51D}": 2,
      "\u{1F630}": -1,
      "\u26BD": 3,
      "\u{1F611}": -2,
      "\u{1F451}": 3,
      "\u{1F449}": 1,
      "\u{1F343}": 1,
      "\u{1F381}": 3,
      "\u{1F620}": -2,
      "\u{1F427}": 2,
      "\u2606": 2,
      "\u{1F340}": 1,
      "\u{1F388}": 3,
      "\u{1F385}": 1,
      "\u{1F613}": -1,
      "\u{1F623}": -2,
      "\u{1F610}": -2,
      "\u270A": 2,
      "\u{1F628}": -1,
      "\u{1F616}": -1,
      "\u{1F4A4}": 1,
      "\u{1F493}": 3,
      "\u{1F44E}": -1,
      "\u{1F4A6}": 2,
      "\u2714": 1,
      "\u{1F637}": -1,
      "\u{1F64B}": 2,
      "\u{1F384}": 2,
      "\u{1F4A9}": -1,
      "\u{1F3B5}": 2,
      "\u{1F61B}": 3,
      "\u{1F46F}": 2,
      "\u{1F48E}": 2,
      "\u{1F33F}": 1,
      "\u{1F382}": 3,
      "\u{1F31F}": 1,
      "\u{1F52E}": 1,
      "\u{1F46B}": 1,
      "\u{1F3C6}": 3,
      "\u2716": 1,
      "\u261D": 1,
      "\u{1F619}": 3,
      "\u26C4": 2,
      "\u{1F445}": 2,
      "\u266A": 2,
      "\u{1F342}": 2,
      "\u{1F48F}": 1,
      "\u{1F334}": 2,
      "\u{1F448}": 2,
      "\u{1F339}": 3,
      "\u{1F646}": 2,
      "\u{1F47B}": 1,
      "\u{1F4B0}": 1,
      "\u{1F37B}": 2,
      "\u{1F645}": -2,
      "\u{1F31E}": 2,
      "\u{1F341}": 2,
      "\u2B50": 2,
      "\u25AA": 1,
      "\u{1F380}": 3,
      "\u{1F437}": 1,
      "\u{1F649}": 1,
      "\u{1F33A}": 2,
      "\u{1F485}": 1,
      "\u{1F436}": 2,
      "\u{1F31A}": 2,
      "\u{1F47D}": 1,
      "\u{1F3A4}": 2,
      "\u{1F46D}": 2,
      "\u{1F3A7}": 2,
      "\u{1F446}": 1,
      "\u{1F378}": 2,
      "\u{1F377}": 2,
      "\xAE": 1,
      "\u{1F349}": 3,
      "\u{1F607}": 3,
      "\u{1F3C3}": 2,
      "\u{1F63F}": -2,
      "\u2502": 1,
      "\u{1F37A}": 2,
      "\u25B6": 1,
      "\u{1F632}": -1,
      "\u{1F3B8}": 2,
      "\u{1F379}": 3,
      "\u{1F4AB}": 2,
      "\u{1F4DA}": 1,
      "\u{1F636}": -1,
      "\u{1F337}": 2,
      "\u{1F49D}": 3,
      "\u{1F4A8}": 1,
      "\u{1F3C8}": 2,
      "\u{1F48D}": 2,
      "\u2614": 1,
      "\u{1F478}": 3,
      "\u{1F1EA}": 3,
      "\u2591": -1,
      "\u{1F369}": 1,
      "\u{1F47E}": 1,
      "\u2601": 1,
      "\u{1F33B}": 2,
      "\u21BF": 3,
      "\u{1F42F}": 2,
      "\u{1F47C}": 1,
      "\u{1F354}": 1,
      "\u{1F638}": 2,
      "\u{1F476}": 2,
      "\u21BE": 3,
      "\u{1F490}": 3,
      "\u{1F30A}": 2,
      "\u{1F366}": 2,
      "\u{1F353}": 3,
      "\u{1F447}": 1,
      "\u{1F486}": 1,
      "\u{1F374}": 2,
      "\u{1F627}": -1,
      "\u{1F1F8}": 2,
      "\u{1F62E}": 1,
      "\u{1F6AB}": -3,
      "\u{1F63D}": 2,
      "\u{1F308}": 2,
      "\u{1F640}": 1,
      "\u26A0": -1,
      "\u{1F3AE}": 2,
      "\u256F": -1,
      "\u{1F346}": 2,
      "\u{1F370}": 2,
      "\u2713": 1,
      "\u{1F450}": -1,
      "\u{1F35F}": 1,
      "\u{1F34C}": 2,
      "\u{1F491}": 3,
      "\u{1F46C}": -1,
      "\u{1F423}": 2,
      "\u{1F383}": 3,
      "\u25AC": 2,
      "\uFFFC": -3,
      "\u{1F43E}": 3,
      "\u{1F393}": 2,
      "\u{1F3CA}": 2,
      "\u{1F4F7}": 2,
      "\u{1F444}": 2,
      "\u{1F33C}": 4,
      "\u{1F6B6}": -1,
      "\u{1F431}": 2,
      "\u{1F438}": -1,
      "\u{1F1FA}": 2,
      "\u{1F47F}": -3,
      "\u{1F6AC}": 2,
      "\u273F": 1,
      "\u{1F412}": 2,
      "\u{1F30D}": 3,
      "\u250A": 5,
      "\u{1F425}": 3,
      "\u{1F43C}": 1,
      "\u{1F3A5}": 1,
      "\u{1F484}": 2,
      "\u26D4": 2,
      "\u{1F3C0}": 1,
      "\u{1F489}": 1,
      "\u{1F49F}": 3,
      "\u{1F697}": 1,
      "\u{1F4DD}": 1,
      "\u2666": 2,
      "\u{1F4AD}": 1,
      "\u{1F319}": 3,
      "\u{1F41F}": 3,
      "\u{1F463}": 1,
      "\u2702": -3,
      "\u{1F5FF}": 2,
      "\u{1F46A}": -1,
      "\u{1F36D}": 1,
      "\u{1F303}": 2,
      "\u274C": 1,
      "\u{1F430}": 3,
      "\u{1F48A}": 2,
      "\u{1F6A8}": 3,
      "\u{1F626}": -2,
      "\u{1F36A}": 1,
      "\u{1F363}": -2,
      "\u2727": 1,
      "\u{1F386}": 3,
      "\u{1F38E}": 4,
      "\u{1F1E9}": 3,
      "\u2705": 2,
      "\u{1F4F1}": 1,
      "\u{1F64D}": -2,
      "\u{1F351}": 1,
      "\u{1F3BC}": 1,
      "\u{1F50A}": 2,
      "\u{1F30C}": 2,
      "\u{1F34E}": 1,
      "\u{1F43B}": 2,
      "\u2570": -1,
      "\u{1F487}": 1,
      "\u266C": 1,
      "\u{1F534}": 2,
      "\u{1F371}": -2,
      "\u{1F34A}": 2,
      "\u{1F352}": 1,
      "\u{1F42D}": 3,
      "\u{1F45F}": 2,
      "\u{1F30E}": 1,
      "\u{1F34D}": 2,
      "\u{1F42E}": 3,
      "\u{1F4F2}": 1,
      "\u263C": 1,
      "\u{1F305}": 1,
      "\u{1F1F7}": 3,
      "\u{1F460}": 1,
      "\u{1F33D}": 2,
      "\u{1F4A7}": -1,
      "\u{1F36C}": 1,
      "\u{1F63A}": 2,
      "\u{1F680}": 2,
      "\xA6": 3,
      "\u{1F4A2}": 1,
      "\u{1F3AC}": 1,
      "\u{1F367}": 1,
      "\u{1F35C}": 2,
      "\u{1F40F}": 3,
      "\u{1F3C4}": 2,
      "\u27A4": 1,
      "\u2B06": 1,
      "\u{1F34B}": 1,
      "\u{1F197}": 2,
      "\u26AA": 2,
      "\u{1F4FA}": 2,
      "\u{1F345}": 1,
      "\u26C5": 2,
      "\u{1F422}": 1,
      "\u{1F459}": 2,
      "\u{1F3E1}": 2,
      "\u{1F33E}": 2,
      "\u25C9": 1,
      "\u270F": 1,
      "\u{1F42C}": 2,
      "\u{1F1F9}": 3,
      "\u2663": 1,
      "\u{1F41D}": 1,
      "\u{1F31D}": 1,
      "\u{1F1EE}": 3,
      "\u{1F50B}": -3,
      "\u{1F40D}": 1,
      "\u2654": 2,
      "\u{1F535}": 1,
      "\u{1F63E}": -2,
      "\u{1F315}": 3,
      "\u{1F428}": 2,
      "\u{1F510}": 1,
      "\u{1F4BF}": 3,
      "\u{1F333}": 2,
      "\u{1F470}": 2,
      "\u2740": 2,
      "\u2693": 3,
      "\u{1F6B4}": 3,
      "\u2580": -1,
      "\u{1F457}": 1,
      "\u2795": 2,
      "\u{1F4AC}": 2,
      "\u2592": -1,
      "\u{1F51C}": 1,
      "\u{1F368}": 1,
      "\u{1F4B2}": 1,
      "\u{1F359}": 1,
      "\u{1F365}": -4,
      "\u25B8": 1,
      "\u265B": 1,
      "\u{1F63C}": 1,
      "\u{1F419}": 2,
      "\u{1F468}": 2,
      "\u{1F35A}": 2,
      "\u2668": 4,
      "\u{1F3B9}": 1,
      "\u2655": 2,
      "\u2583": 5,
      "\u{1F1EC}": 1,
      "\u{1F1E7}": 1,
      "\u2620": -1,
      "\u{1F420}": 2,
      "\u{1F6B9}": 3,
      "\u{1F4B5}": 2,
      "\u2730": 4,
      "\u2560": 1,
      "\u{1F45B}": 2,
      "\u{1F331}": 3,
      "\u{1F4BB}": 1,
      "\u{1F30F}": 1,
      "\u2584": -1,
      "\u{1F453}": 1,
      "\u25C4": 1,
      "\u26BE": -1,
      "\u{1F332}": 2,
      "\u{1F474}": 1,
      "\u{1F3E0}": 2,
      "\u{1F347}": 1,
      "\u{1F358}": 2,
      "\u{1F407}": 1,
      "\u{1F51E}": -1,
      "\u{1F475}": 2,
      "\u25C0": 1,
      "\u{1F519}": 1,
      "\u{1F335}": 1,
      "\u{1F36E}": -1,
      "\u{1F387}": 3,
      "\u{1F40E}": 2,
      "\u2794": -1,
      "\u{1F424}": 2,
      "\u2569": 1,
      "\u{1F311}": 2,
      "\u{1F6B2}": 2,
      "\u{1F411}": -1,
      "\u{1F3C1}": 2,
      "\u{1F3BE}": 3,
      "\u255A": 1,
      "\u{1F239}": 1,
      "\u{1F46E}": -2,
      "\u2639": -3,
      "\u{1F435}": 2,
      "\u272A": 1,
      "\u25D5": 2,
      "\u{1F5FC}": 3,
      "\u2590": -1,
      "\u2660": 1,
      "\u2533": -2,
      "\u{1F47A}": -2,
      "\u{1F41A}": 1,
      "\u{1F442}": -1,
      "\u{1F5FD}": 1,
      "\u{1F375}": 2,
      "\u{1F192}": 2,
      "\u{1F43A}": 1,
      "\u21E8": 2,
      "\u{1F313}": 3,
      "\u{1F512}": 1,
      "\u256C": -1,
      "\u{1F473}": 3,
      "\u{1F302}": 1,
      "\u{1F68C}": 1,
      "\u2669": 3,
      "\u{1F361}": -1,
      "\u2765": 1,
      "\u{1F3A1}": 1,
      "\u{1F48C}": 2,
      "\u{1F429}": 2,
      "\u{1F31C}": 2,
      "\u231A": 1,
      "\u{1F6BF}": 3,
      "\u{1F506}": 3,
      "\u{1F31B}": 3,
      "\u{1F482}": -1,
      "\u{1F414}": 1,
      "\u{1F64E}": -1,
      "\u{1F3E9}": 2,
      "\u{1F1EB}": 2,
      "\u{1F528}": -1,
      "\u{1F4E2}": 2,
      "\u{1F426}": 2,
      "\u{1F432}": -1,
      "\u267B": 2,
      "\u{1F318}": 3,
      "\u{1F314}": 3,
      "\u{1F456}": 2,
      "\u{1F617}": 3,
      "\u{1F404}": 1,
      "\u25DF": -1,
      "\u{1F362}": -1,
      "\u{1F3A8}": 1,
      "\u2B07": 2,
      "\u{1F6BC}": 3,
      "\u{1F1F4}": 2,
      "\u{1F317}": 3,
      "\u{1F316}": 3,
      "\u{1F505}": 5,
      "\u{1F45C}": 1,
      "\u{1F40C}": 3,
      "\u{1F4BC}": 3,
      "\u{1F439}": 1,
      "\u{1F320}": 3,
      "\u{1F408}": 1,
      "\u{1F301}": 1,
      "\u26AB": 1,
      "\u2667": 2,
      "\u{1F3F0}": 1,
      "\u{1F6B5}": 2,
      "\u{1F3A2}": 2,
      "\u{1F3B7}": 3,
      "\u{1F390}": 1,
      "\u2508": -4,
      "\u2557": 2,
      "\u{1F307}": 3,
      "\u23F0": 2,
      "\u{1F682}": 1,
      "\u25E0": 2,
      "\u{1F3BF}": 2,
      "\u{1F194}": 4,
      "\u{1F312}": 3,
      "\u{1F42A}": 3,
      "\u2554": 1,
      "\u255D": 2,
      "\u{1F454}": 2,
      "\u{1F193}": 1,
      "\u{1F40B}": 1,
      "\u25BD": 2,
      "\u{1F41B}": 1,
      "\u{1F455}": 2,
      "\u{1F4B3}": 2,
      "\u{1F3E7}": 5,
      "\u{1F4A1}": 3,
      "\u2B05": 2,
      "\u{1F42B}": 2,
      "\u{1F1F1}": 2,
      "\u{1F4F9}": 2,
      "\u{1F45E}": 2,
      "\u{1F45A}": 3,
      "\u25A1": -2,
      "\u{1F6A3}": 3,
      "\u{1F3C9}": 3,
      "\u{1F5FB}": 3,
      "\u2566": 2,
      "\u26FA": 3,
      "\u{1F415}": 1,
      "\u{1F3C2}": 2,
      "\u{1F461}": 2,
      "\u{1F4FB}": 2,
      "\u2712": 1,
      "\u{1F330}": 3,
      "\u{1F3E2}": 1,
      "\u{1F392}": 3,
      "\u2312": 3,
      "\u{1F3EB}": -2,
      "\u{1F4F4}": 4,
      "\u{1F6A2}": 1,
      "\u{1F69A}": -1,
      "\u{1F409}": 1,
      "\u2752": 1,
      "\u{1F514}": 5,
      "\u25E2": 4,
      "\u{1F3E5}": 1,
      "\u{1F696}": -1,
      "\u258C": -2,
      "\u261B": 2,
      "\u{1F492}": 3,
      "\u{1F6A4}": 2,
      "\u{1F410}": 2,
      "\u25A0": -2,
      "\u{1F51A}": 2,
      "\u{1F3BB}": 2,
      "\u{1F537}": 1,
      "\u{1F3BD}": 2,
      "\u{1F4C5}": 1,
      "\u{1F3BA}": 3,
      "\u{1F348}": -3,
      "\u2709": 1,
      "\u25E4": 5,
      "\u25CB": 3,
      "\u{1F37C}": 3,
      "\u{1F69B}": -2,
      "\u{1F4D3}": 1,
      "\u2609": 1,
      "\u{1F4B4}": -2,
      "\u27B0": -1,
      "\u{1F50C}": -1,
      "\u{1F4D5}": 1,
      "\u{1F4E3}": 2,
      "\u{1F693}": 1,
      "\u{1F417}": 3,
      "\u26F3": 4,
      "\u253B": -3,
      "\u251B": 3,
      "\u2503": 2,
      "\u{1F4BA}": 1,
      "\u{1F3C7}": -1,
      "\u263B": 1,
      "\u{1F4DE}": 2,
      "\u24B6": -1,
      "\u{1F309}": 3,
      "\u{1F6A9}": -2,
      "\u270E": 3,
      "\u{1F4C3}": 2,
      "\u{1F3E8}": 1,
      "\u{1F4CC}": -3,
      "\u264E": -1,
      "\u{1F4B7}": 2,
      "\u{1F684}": 3,
      "\u25B2": 3,
      "\u26F5": 3,
      "\u{1F538}": 1,
      "\u{1F69C}": 5,
      "\u{1F406}": 2,
      "\u{1F452}": 1,
      "\u2755": 1,
      "\u{1F51B}": 2,
      "\u2662": 2,
      "\u{1F1F2}": 2,
      "\u2745": 4,
      "\u{1F45D}": 2,
      "\u271E": 2,
      "\u25E1": 1,
      "\u{1F38B}": 3,
      "\u{1F465}": 1,
      "\u{1F421}": 1,
      "\u25C6": 4,
      "\u{1F52D}": 2,
      "\u{1F3AA}": 1,
      "\u{1F41C}": 3,
      "\u264C": 4,
      "\u2610": -5,
      "\u{1F477}": 1,
      "\u{1F508}": 1,
      "\u{1F4C4}": 5,
      "\u{1F690}": 4,
      "\u{1F30B}": 3,
      "\u{1F4E1}": 1,
      "\u{1F6B3}": 5,
      "\u2718": 4,
      "\u{1F170}": 1,
      "\u{1F1FC}": 2,
      "\u2513": 3,
      "\u2523": 3,
      "\u24C1": 2,
      "\u24BA": 2,
      "\u{1F464}": 4,
      "\u{1F681}": 1,
      "\u{1F3A0}": 3,
      "\u{1F401}": -2,
      "\u{1F4D7}": 1,
      "\u2510": -1,
      "\u2642": 1,
      "\u{1F4EF}": -1,
      "\u{1F529}": 1,
      "\u{1F462}": 4,
      "\u25C2": 2,
      "\u{1F4F0}": 1,
      "\u{1F4F6}": 2,
      "\u{1F304}": 1,
      "\u{1F5FE}": 2,
      "\u{1F536}": 2,
      "\u{1F3E4}": 2,
      "\u{1F3A9}": 2,
      "\u24C2": 1,
      "\u{1F527}": -4,
      "\u{1F405}": 1,
      "\u266E": 1,
      "\u{1F17E}": -1,
      "\u{1F4E6}": 1,
      "\u{1F68A}": 1,
      "\u{1F532}": 3,
      "\u25B3": 1,
      "\u{1F4C6}": 5,
      "\u275B": 2,
      "\u{1F4C9}": 2,
      "\u25B5": 2,
      "\u{1F50E}": 3,
      "\u261C": 1,
      "\u{1F1EF}": 2,
      "\u{1F1F5}": 2,
      "\u{1F4D8}": 1,
      "\u24D4": 3,
      "\u{1F511}": 1,
      "\u2B55": 2,
      "\u{1F518}": 1,
      "\u{1F6AD}": 5,
      "\u{1F689}": 3,
      "\u{1F6AA}": 3,
      "\u27B3": 2,
      "\u{1F683}": 3,
      "\u252F": -3,
      "\u{1F199}": 2,
      "\u{1F196}": 1,
      "\u2517": 5,
      "\u24C4": 2,
      "\u2747": 3,
      "\u2734": 3,
      "\u260A": 5,
      "\u{1F515}": -2,
      "\u2B1B": -2,
      "\u{1F69E}": 3,
      "\u{1F376}": 3,
      "\u{1F310}": 3,
      "\u2640": 1,
      "\u{1F685}": 3,
      "\u{1F692}": -2,
      "\u264B": 1,
      "\u264D": 3,
      "\u{1F55D}": -2,
      "\u24D0": 5,
      "\u{1F4D9}": 1,
      "\u24C8": 1,
      "\u{1F4CB}": 3,
      "\u{1F3B1}": 1,
      "\u{1F41E}": 1,
      "\u{1F53A}": 1,
      "\u24E1": 5,
      "\u2664": 3,
      "\u{1F3AF}": 3,
      "\u{1F509}": 3,
      "\u21A9": 5,
      "\u{1F6BE}": 1,
      "\u{1F3A3}": -4,
      "\u{1F523}": 1,
      "\u274E": -5,
      "\u27A5": 1,
      "\u{1F38C}": 5,
      "\u25E3": 1,
      "\u23EC": 5,
      "\u266D": 1,
      "\u24DE": 5,
      "\u{1F533}": 2,
      "\u{1F3ED}": 2,
      "\u{1F3B3}": -3,
      "\u261A": 5,
      "\u27BD": 2,
      "\u27AB": 2,
      "\u2796": -5,
      "\uA4B0": 2,
      "\uA4B1": 2,
      "\u25DD": -3,
      "\u{1F4D1}": 5,
      "\u24E7": 5,
      "\u{1F51F}": 5,
      "\u3013": 5,
      "\u24DC": 2,
      "\u27A0": 5,
      "\u{1F686}": 2,
      "\u2105": -5,
      "\u2603": 2,
      "\u{1F6BD}": 5,
      "\u24DD": 5,
      "\u21E6": 5,
      "\u{1F472}": 2,
      "\u{1F6A1}": -3,
      "\u{1F52C}": 5,
      "\u2797": -3,
      "\u{1F4C8}": 2,
      "\u23EA": 2,
      "\u25CE": 5,
      "\uA4A6": -5,
      "\u{1F4CE}": 5,
      "\u2445": 5,
      "\u272D": 5,
      "\u2653": 2,
      "\u250F": 5,
      "\u2607": 5,
      "\u0FCE": -5,
      "\u{1F458}": 5,
      "\u2199": 5,
      "\u24BB": 2,
      "\u24CC": 2,
      "\u24C5": 2,
      "\u{1F551}": 2,
      "\u{1F55B}": 5,
      "\u2648": -5,
      "\u21AC": 5,
      "\u270D": 5,
      "\u{1F3E6}": 5,
      "\u{1F53B}": 5,
      "\u24DF": 5,
      "\u24D5": 5,
      "\u24D8": 5,
      "\u267F": 5,
      "\u21D7": 5,
      "\u21D8": 5,
      "\u24E8": 5,
      "\u24D9": 5,
      "\u25AB": 5,
      "\u{1F507}": 5,
      "\u2303": -5,
      "\u{1F516}": 5,
      "\u{1F4DC}": 5,
      "\u{1F69D}": 5,
      "\u2518": -5,
      "\u271D": -5,
      "\u2363": -5,
      "\u{1F4EE}": -5,
      "\u{1F555}": -5,
      "\u{1F52F}": 5,
      "\u27B8": 5,
      "\uA4B5": 5,
      "\u{1F565}": -5,
      "\u273D": 5,
      "\u{1F4FC}": 5,
      "\u{1F550}": -5,
      "\u{1F004}": 5,
      "\u272C": 5,
      "\u272B": 5,
      "\u{1F554}": -5,
      "\u2763": 5,
      "\u{1F4EB}": 5,
      "\u{1F250}": 5,
      "\u{1F202}": -5,
      "\u{1F3B0}": -5,
      "\u0482": -5,
      "\u2564": -5,
      "\u{1F4D4}": 5
    };
  }
});

// node_modules/sentiment/languages/en/labels.json
var require_labels = __commonJS({
  "node_modules/sentiment/languages/en/labels.json"(exports, module) {
    module.exports = {
      abandon: -2,
      abandoned: -2,
      abandons: -2,
      abducted: -2,
      abduction: -2,
      abductions: -2,
      abhor: -3,
      abhorred: -3,
      abhorrent: -3,
      abhors: -3,
      abilities: 2,
      ability: 2,
      aboard: 1,
      aborted: -1,
      aborts: -1,
      absentee: -1,
      absentees: -1,
      absolve: 2,
      absolved: 2,
      absolves: 2,
      absolving: 2,
      absorbed: 1,
      abuse: -3,
      abused: -3,
      abuses: -3,
      abusing: -3,
      abusive: -3,
      accept: 1,
      acceptable: 1,
      acceptance: 1,
      accepted: 1,
      accepting: 1,
      accepts: 1,
      accessible: 1,
      accident: -2,
      accidental: -2,
      accidentally: -2,
      accidents: -2,
      acclaim: 2,
      acclaimed: 2,
      accolade: 2,
      accomplish: 2,
      accomplished: 2,
      accomplishes: 2,
      accomplishment: 2,
      accomplishments: 2,
      accusation: -2,
      accusations: -2,
      accuse: -2,
      accused: -2,
      accuses: -2,
      accusing: -2,
      ache: -2,
      achievable: 1,
      aching: -2,
      acquit: 2,
      acquits: 2,
      acquitted: 2,
      acquitting: 2,
      acrimonious: -3,
      active: 1,
      adequate: 1,
      admire: 3,
      admired: 3,
      admires: 3,
      admiring: 3,
      admit: -1,
      admits: -1,
      admitted: -1,
      admonish: -2,
      admonished: -2,
      adopt: 1,
      adopts: 1,
      adorable: 3,
      adoration: 3,
      adore: 3,
      adored: 3,
      adores: 3,
      adoring: 3,
      adoringly: 3,
      advanced: 1,
      advantage: 2,
      advantageous: 2,
      advantageously: 2,
      advantages: 2,
      adventure: 2,
      adventures: 2,
      adventurous: 2,
      adversary: -1,
      advisable: 1,
      affected: -1,
      affection: 3,
      affectionate: 3,
      affectionateness: 3,
      afflicted: -1,
      affordable: 2,
      affronted: -1,
      aficionados: 2,
      afraid: -2,
      aggravate: -2,
      aggravated: -2,
      aggravates: -2,
      aggravating: -2,
      aggression: -2,
      aggressions: -2,
      aggressive: -2,
      aggressiveness: -2,
      aghast: -2,
      agog: 2,
      agonise: -3,
      agonised: -3,
      agonises: -3,
      agonising: -3,
      agonize: -3,
      agonized: -3,
      agonizes: -3,
      agonizing: -3,
      agree: 1,
      agreeable: 2,
      agreed: 1,
      agreement: 1,
      agrees: 1,
      alarm: -2,
      alarmed: -2,
      alarmist: -2,
      alarmists: -2,
      alas: -1,
      alert: -1,
      alienation: -2,
      alive: 1,
      allegation: -2,
      allegations: -2,
      allergic: -2,
      allow: 1,
      ally: 2,
      alone: -2,
      altruistic: 2,
      amaze: 2,
      amazed: 2,
      amazes: 2,
      amazing: 4,
      ambitious: 2,
      ambivalent: -1,
      amicable: 2,
      amuse: 3,
      amused: 3,
      amusement: 3,
      amusements: 3,
      anger: -3,
      angered: -3,
      angers: -3,
      angry: -3,
      anguish: -3,
      anguished: -3,
      animosity: -2,
      annoy: -2,
      annoyance: -2,
      annoyed: -2,
      annoying: -2,
      annoys: -2,
      antagonistic: -2,
      anti: -1,
      anticipation: 1,
      anxiety: -2,
      anxious: -2,
      apathetic: -3,
      apathy: -3,
      apeshit: -3,
      apocalyptic: -2,
      apologise: -1,
      apologised: -1,
      apologises: -1,
      apologising: -1,
      apologize: -1,
      apologized: -1,
      apologizes: -1,
      apologizing: -1,
      apology: -1,
      appalled: -2,
      appalling: -2,
      appealing: 2,
      appease: 2,
      appeased: 2,
      appeases: 2,
      appeasing: 2,
      applaud: 2,
      applauded: 2,
      applauding: 2,
      applauds: 2,
      applause: 2,
      appreciate: 2,
      appreciated: 2,
      appreciates: 2,
      appreciating: 2,
      appreciation: 2,
      apprehensive: -2,
      appropriate: 2,
      appropriately: 2,
      approval: 2,
      approved: 2,
      approves: 2,
      ardent: 1,
      arrest: -2,
      arrested: -3,
      arrests: -2,
      arrogant: -2,
      arsehole: -4,
      ashame: -2,
      ashamed: -2,
      ass: -4,
      assassination: -3,
      assassinations: -3,
      assault: -2,
      assaults: -2,
      asset: 2,
      assets: 2,
      assfucking: -4,
      asshole: -4,
      astonished: 2,
      astound: 3,
      astounded: 3,
      astounding: 3,
      astoundingly: 3,
      astounds: 3,
      atrocious: -3,
      atrocity: -3,
      attack: -1,
      attacked: -1,
      attacking: -1,
      attacks: -1,
      attract: 1,
      attracted: 1,
      attracting: 2,
      attraction: 2,
      attractions: 2,
      attractive: 2,
      attractively: 2,
      attractiveness: 2,
      attracts: 1,
      audacious: 3,
      aura: 1,
      authority: 1,
      avenge: -2,
      avenged: -2,
      avenger: -2,
      avengers: -2,
      avenges: -2,
      avenging: -2,
      avert: -1,
      averted: -1,
      averts: -1,
      avid: 2,
      avoid: -1,
      avoided: -1,
      avoids: -1,
      await: -1,
      awaited: -1,
      awaits: -1,
      award: 3,
      awarded: 3,
      awards: 3,
      awesome: 4,
      awful: -3,
      awkward: -2,
      axe: -1,
      axed: -1,
      backed: 1,
      backing: 2,
      backs: 1,
      bad: -3,
      "bad luck": -2,
      badass: -3,
      badly: -3,
      badness: -3,
      bailout: -2,
      balanced: 1,
      bamboozle: -2,
      bamboozled: -2,
      bamboozles: -2,
      ban: -2,
      banish: -1,
      bankrupt: -3,
      bankruptcy: -3,
      bankster: -3,
      banned: -2,
      barbarian: -2,
      barbaric: -2,
      barbarous: -2,
      bargain: 2,
      barrier: -2,
      bastard: -5,
      bastards: -5,
      battle: -1,
      battled: -1,
      battles: -1,
      battling: -2,
      beaten: -2,
      beatific: 3,
      beating: -1,
      beauties: 3,
      beautiful: 3,
      beautifully: 3,
      beautify: 3,
      beauty: 3,
      befit: 2,
      befitting: 2,
      belittle: -2,
      belittled: -2,
      beloved: 3,
      benefactor: 2,
      benefactors: 2,
      benefit: 2,
      benefits: 2,
      benefitted: 2,
      benefitting: 2,
      benevolent: 3,
      bereave: -2,
      bereaved: -2,
      bereaves: -2,
      bereaving: -2,
      best: 3,
      "best damn": 4,
      betray: -3,
      betrayal: -3,
      betrayed: -3,
      betraying: -3,
      betrays: -3,
      better: 2,
      bias: -1,
      biased: -2,
      big: 1,
      bitch: -5,
      bitches: -5,
      bitter: -2,
      bitterest: -2,
      bitterly: -2,
      bizarre: -2,
      blackmail: -3,
      blackmailed: -3,
      blackmailing: -3,
      blackmails: -3,
      blah: -2,
      blame: -2,
      blamed: -2,
      blames: -2,
      blaming: -2,
      bless: 2,
      blesses: 2,
      blessing: 3,
      blessings: 3,
      blind: -1,
      bliss: 3,
      blissful: 3,
      blithe: 2,
      bloated: -1,
      block: -1,
      blockade: -2,
      blockbuster: 3,
      blocked: -1,
      blocking: -1,
      blocks: -1,
      bloody: -3,
      blurry: -2,
      boastful: -2,
      bold: 2,
      boldly: 2,
      bomb: -1,
      boost: 1,
      boosted: 1,
      boosting: 1,
      boosts: 1,
      bore: -2,
      bored: -2,
      boring: -3,
      bother: -2,
      bothered: -2,
      bothers: -2,
      bothersome: -2,
      boycott: -2,
      boycotted: -2,
      boycotting: -2,
      boycotts: -2,
      brainwashing: -3,
      brave: 2,
      braveness: 2,
      bravery: 2,
      bravura: 3,
      breach: -2,
      breached: -2,
      breaches: -2,
      breaching: -2,
      breakthrough: 3,
      breathtaking: 5,
      bribe: -3,
      bribed: -3,
      bribes: -3,
      bribing: -3,
      bright: 1,
      brightest: 2,
      brightness: 1,
      brilliant: 4,
      brilliance: 3,
      brilliances: 3,
      brisk: 2,
      broke: -1,
      broken: -1,
      brooding: -2,
      brutal: -3,
      brutally: -3,
      bullied: -2,
      bullshit: -4,
      bully: -2,
      bullying: -2,
      bummer: -2,
      buoyant: 2,
      burden: -2,
      burdened: -2,
      burdening: -2,
      burdens: -2,
      burglar: -2,
      burglary: -2,
      calm: 2,
      calmed: 2,
      calming: 2,
      calms: 2,
      "can't stand": -3,
      cancel: -1,
      cancelled: -1,
      cancelling: -1,
      cancels: -1,
      cancer: -1,
      capabilities: 1,
      capability: 1,
      capable: 1,
      captivated: 3,
      care: 2,
      carefree: 1,
      careful: 2,
      carefully: 2,
      carefulness: 2,
      careless: -2,
      cares: 2,
      caring: 2,
      "cashing in": -2,
      casualty: -2,
      catastrophe: -3,
      catastrophic: -4,
      cautious: -1,
      celebrate: 3,
      celebrated: 3,
      celebrates: 3,
      celebrating: 3,
      celebration: 3,
      celebrations: 3,
      censor: -2,
      censored: -2,
      censors: -2,
      certain: 1,
      chagrin: -2,
      chagrined: -2,
      challenge: -1,
      champion: 2,
      championed: 2,
      champions: 2,
      chance: 2,
      chances: 2,
      chaos: -2,
      chaotic: -2,
      charged: -3,
      charges: -2,
      charisma: 2,
      charitable: 2,
      charm: 3,
      charming: 3,
      charmingly: 3,
      charmless: -3,
      chastise: -3,
      chastised: -3,
      chastises: -3,
      chastising: -3,
      cheat: -3,
      cheated: -3,
      cheater: -3,
      cheaters: -3,
      cheating: -3,
      cheats: -3,
      cheer: 2,
      cheered: 2,
      cheerful: 2,
      cheerfully: 2,
      cheering: 2,
      cheerless: -2,
      cheers: 2,
      cheery: 3,
      cherish: 2,
      cherished: 2,
      cherishes: 2,
      cherishing: 2,
      chic: 2,
      chide: -3,
      chided: -3,
      chides: -3,
      chiding: -3,
      childish: -2,
      chilling: -1,
      choke: -2,
      choked: -2,
      chokes: -2,
      choking: -2,
      clarifies: 2,
      clarity: 2,
      clash: -2,
      classy: 3,
      clean: 2,
      cleaner: 2,
      clear: 1,
      cleared: 1,
      clearly: 1,
      clears: 1,
      clever: 2,
      clouded: -1,
      clueless: -2,
      cock: -5,
      cocksucker: -5,
      cocksuckers: -5,
      cocky: -2,
      coerced: -2,
      coercion: -2,
      collapse: -2,
      collapsed: -2,
      collapses: -2,
      collapsing: -2,
      collide: -1,
      collides: -1,
      colliding: -1,
      collision: -2,
      collisions: -2,
      colluding: -3,
      combat: -1,
      combats: -1,
      comedy: 1,
      comfort: 2,
      comfortable: 2,
      comfortably: 2,
      comforting: 2,
      comforts: 2,
      comic: 1,
      commend: 2,
      commended: 2,
      commit: 1,
      commitment: 2,
      commits: 1,
      committed: 1,
      committing: 1,
      compassion: 2,
      compassionate: 2,
      compelled: 1,
      competencies: 1,
      competent: 2,
      competitive: 2,
      complacent: -2,
      complain: -2,
      complained: -2,
      complaining: -2,
      complains: -2,
      complaint: -2,
      complaints: -2,
      complicating: -2,
      compliment: 2,
      complimented: 2,
      compliments: 2,
      comprehensive: 2,
      concerned: -2,
      conciliate: 2,
      conciliated: 2,
      conciliates: 2,
      conciliating: 2,
      condemn: -2,
      condemnation: -2,
      condemned: -2,
      condemns: -2,
      confidence: 2,
      confident: 2,
      confidently: 2,
      conflict: -2,
      conflicting: -2,
      conflictive: -2,
      conflicts: -2,
      confuse: -2,
      confused: -2,
      confusing: -2,
      congrats: 2,
      congratulate: 2,
      congratulation: 2,
      congratulations: 2,
      consent: 2,
      consents: 2,
      consolable: 2,
      conspiracy: -3,
      constipation: -2,
      constrained: -2,
      contagion: -2,
      contagions: -2,
      contagious: -1,
      contaminant: -2,
      contaminants: -2,
      contaminate: -2,
      contaminated: -2,
      contaminates: -2,
      contaminating: -2,
      contamination: -2,
      contaminations: -2,
      contempt: -2,
      contemptible: -2,
      contemptuous: -2,
      contemptuously: -2,
      contend: -1,
      contender: -1,
      contending: -1,
      contentious: -2,
      contestable: -2,
      controversial: -2,
      controversially: -2,
      controversies: -2,
      controversy: -2,
      convicted: -2,
      convince: 1,
      convinced: 1,
      convinces: 1,
      convivial: 2,
      cool: 1,
      "cool stuff": 3,
      cornered: -2,
      corpse: -1,
      corrupt: -3,
      corrupted: -3,
      corrupting: -3,
      corruption: -3,
      corrupts: -3,
      costly: -2,
      courage: 2,
      courageous: 2,
      courageously: 2,
      courageousness: 2,
      courteous: 2,
      courtesy: 2,
      "cover-up": -3,
      coward: -2,
      cowardly: -2,
      coziness: 2,
      cramp: -1,
      crap: -3,
      crappy: -3,
      crash: -2,
      crazier: -2,
      craziest: -2,
      crazy: -2,
      creative: 2,
      crestfallen: -2,
      cried: -2,
      cries: -2,
      crime: -3,
      crimes: -3,
      criminal: -3,
      criminals: -3,
      criminate: -3,
      criminated: -3,
      criminates: -3,
      crisis: -3,
      critic: -2,
      criticise: -2,
      criticised: -2,
      criticises: -2,
      criticising: -2,
      criticism: -2,
      criticize: -2,
      criticized: -2,
      criticizes: -2,
      criticizing: -2,
      critics: -2,
      critique: -2,
      crowding: -1,
      crude: -1,
      cruel: -3,
      cruelty: -3,
      crush: -1,
      crushed: -2,
      crushes: -1,
      crushing: -1,
      cry: -1,
      crying: -2,
      cunning: 2,
      cunt: -5,
      curious: 1,
      curse: -1,
      cut: -1,
      cutback: -2,
      cutbacks: -2,
      cute: 2,
      cuts: -1,
      cutting: -1,
      cynic: -2,
      cynical: -2,
      cynicism: -2,
      damage: -3,
      damaged: -3,
      damages: -3,
      damaging: -3,
      damn: -2,
      "damn cute": 3,
      "damn good": 4,
      damned: -4,
      damnit: -4,
      danger: -2,
      dangerous: -2,
      dangerously: -2,
      daredevil: 2,
      daring: 2,
      darkest: -2,
      darkness: -1,
      dauntless: 2,
      dazzling: 3,
      dead: -3,
      deadening: -2,
      deadlock: -2,
      deadly: -3,
      deafening: -1,
      dear: 2,
      dearly: 3,
      death: -2,
      deaths: -2,
      debonair: 2,
      debt: -2,
      deceit: -3,
      deceitful: -3,
      deceive: -3,
      deceived: -3,
      deceives: -3,
      deceiving: -3,
      deception: -3,
      deceptive: -3,
      decisive: 1,
      dedicated: 2,
      dedication: 2,
      defeat: -2,
      defeated: -2,
      defect: -3,
      defective: -3,
      defects: -3,
      defender: 2,
      defenders: 2,
      defenseless: -2,
      defer: -1,
      deferring: -1,
      defiant: -1,
      deficient: -2,
      deficiency: -2,
      deficiencies: -2,
      deficit: -2,
      deformed: -2,
      deformities: -2,
      deformity: -2,
      defraud: -3,
      defrauds: -3,
      deft: 2,
      defunct: -2,
      degrade: -2,
      degraded: -2,
      degrades: -2,
      dehumanize: -2,
      dehumanized: -2,
      dehumanizes: -2,
      dehumanizing: -2,
      deject: -2,
      dejected: -2,
      dejecting: -2,
      dejects: -2,
      delay: -1,
      delayed: -1,
      delectable: 3,
      delicious: 3,
      delight: 3,
      delighted: 3,
      delightful: 3,
      delightfully: 3,
      delighting: 3,
      delights: 3,
      demand: -1,
      demanded: -1,
      demanding: -1,
      demands: -1,
      demonstration: -1,
      demoralize: -2,
      demoralized: -2,
      demoralizes: -2,
      demoralizing: -2,
      denial: -2,
      denials: -2,
      denied: -2,
      denier: -2,
      deniers: -2,
      denies: -2,
      denounce: -2,
      denounces: -2,
      dent: -2,
      deny: -2,
      denying: -2,
      deplore: -3,
      deplored: -3,
      deplores: -3,
      deploring: -3,
      deport: -2,
      deported: -2,
      deporting: -2,
      deports: -2,
      deportation: -2,
      deportations: -2,
      depressed: -2,
      depressing: -2,
      deprivation: -3,
      derail: -2,
      derailed: -2,
      derails: -2,
      derelict: -2,
      deride: -2,
      derided: -2,
      derides: -2,
      deriding: -2,
      derision: -2,
      desirable: 2,
      desire: 1,
      desired: 2,
      desirous: 2,
      despair: -3,
      despairing: -3,
      despairs: -3,
      desperate: -3,
      desperately: -3,
      despondent: -3,
      destroy: -3,
      destroyed: -3,
      destroying: -3,
      destroys: -3,
      destruction: -3,
      destructive: -3,
      detached: -1,
      detain: -2,
      detained: -2,
      detention: -2,
      deteriorate: -2,
      deteriorated: -2,
      deteriorates: -2,
      deteriorating: -2,
      determined: 2,
      deterrent: -2,
      detract: -1,
      detracted: -1,
      detracts: -1,
      devastate: -2,
      devastated: -2,
      devastating: -2,
      devastation: -2,
      devastations: -2,
      devoted: 3,
      devotion: 2,
      devotional: 2,
      diamond: 1,
      dick: -4,
      dickhead: -4,
      die: -3,
      died: -3,
      difficult: -1,
      diffident: -2,
      dignity: 2,
      dilemma: -1,
      dilligence: 2,
      dipshit: -3,
      dire: -3,
      direful: -3,
      dirt: -2,
      dirtier: -2,
      dirtiest: -2,
      dirty: -2,
      disabilities: -2,
      disability: -2,
      disabling: -1,
      disadvantage: -2,
      disadvantaged: -2,
      disagree: -2,
      disagreeable: -2,
      disagreement: -2,
      disappear: -1,
      disappeared: -1,
      disappears: -1,
      disappoint: -2,
      disappointed: -2,
      disappointing: -2,
      disappointment: -2,
      disappointments: -2,
      disappoints: -2,
      disapproval: -2,
      disapprovals: -2,
      disapprove: -2,
      disapproved: -2,
      disapproves: -2,
      disapproving: -2,
      disaster: -2,
      disasters: -2,
      disastrous: -3,
      disbelieve: -2,
      discard: -1,
      discarded: -1,
      discarding: -1,
      discards: -1,
      discernment: 2,
      discomfort: -2,
      disconsolate: -2,
      disconsolation: -2,
      discontented: -2,
      discord: -2,
      discounted: -1,
      discouraged: -2,
      discredited: -2,
      discriminate: -2,
      discriminated: -2,
      discriminates: -2,
      discriminating: -2,
      discriminatory: -2,
      disdain: -2,
      disease: -1,
      diseases: -1,
      disgrace: -2,
      disgraced: -2,
      disguise: -1,
      disguised: -1,
      disguises: -1,
      disguising: -1,
      disgust: -3,
      disgusted: -3,
      disgustful: -3,
      disgusting: -3,
      disheartened: -2,
      dishonest: -2,
      disillusioned: -2,
      disinclined: -2,
      disjointed: -2,
      dislike: -2,
      disliked: -2,
      dislikes: -2,
      dismal: -2,
      dismayed: -2,
      dismissed: -2,
      disorder: -2,
      disorders: -2,
      disorganized: -2,
      disoriented: -2,
      disparage: -2,
      disparaged: -2,
      disparages: -2,
      disparaging: -2,
      displeased: -2,
      displeasure: -2,
      disproportionate: -2,
      dispute: -2,
      disputed: -2,
      disputes: -2,
      disputing: -2,
      disqualified: -2,
      disquiet: -2,
      disregard: -2,
      disregarded: -2,
      disregarding: -2,
      disregards: -2,
      disrespect: -2,
      disrespected: -2,
      disrupt: -2,
      disrupted: -2,
      disrupting: -2,
      disruption: -2,
      disruptions: -2,
      disruptive: -2,
      disrupts: -2,
      dissatisfied: -2,
      distasteful: -2,
      distinguished: 2,
      distort: -2,
      distorted: -2,
      distorting: -2,
      distorts: -2,
      distract: -2,
      distracted: -2,
      distraction: -2,
      distracts: -2,
      distress: -2,
      distressed: -2,
      distresses: -2,
      distressing: -2,
      distrust: -3,
      distrustful: -3,
      disturb: -2,
      disturbed: -2,
      disturbing: -2,
      disturbs: -2,
      dithering: -2,
      diverting: -1,
      dizzy: -1,
      dodging: -2,
      dodgy: -2,
      "does not work": -3,
      dolorous: -2,
      donate: 2,
      donated: 2,
      donates: 2,
      donating: 2,
      donation: 2,
      "dont like": -2,
      doom: -2,
      doomed: -2,
      doubt: -1,
      doubted: -1,
      doubtful: -1,
      doubting: -1,
      doubts: -1,
      douche: -3,
      douchebag: -3,
      dour: -2,
      downcast: -2,
      downer: -2,
      downhearted: -2,
      downside: -2,
      drag: -1,
      dragged: -1,
      drags: -1,
      drained: -2,
      dread: -2,
      dreaded: -2,
      dreadful: -3,
      dreading: -2,
      dream: 1,
      dreams: 1,
      dreary: -2,
      droopy: -2,
      drop: -1,
      dropped: -1,
      drown: -2,
      drowned: -2,
      drowns: -2,
      drudgery: -2,
      drunk: -2,
      dubious: -2,
      dud: -2,
      dull: -2,
      dumb: -3,
      dumbass: -3,
      dump: -1,
      dumped: -2,
      dumps: -1,
      dupe: -2,
      duped: -2,
      dupery: -2,
      durable: 2,
      dying: -3,
      dysfunction: -2,
      eager: 2,
      earnest: 2,
      ease: 2,
      easy: 1,
      ecstatic: 4,
      eerie: -2,
      eery: -2,
      effective: 2,
      effectively: 2,
      effectiveness: 2,
      effortlessly: 2,
      elated: 3,
      elation: 3,
      elegant: 2,
      elegantly: 2,
      embarrass: -2,
      embarrassed: -2,
      embarrasses: -2,
      embarrassing: -2,
      embarrassment: -2,
      embezzlement: -3,
      embittered: -2,
      embrace: 1,
      emergency: -2,
      empathetic: 2,
      empower: 2,
      empowerment: 2,
      emptiness: -1,
      empty: -1,
      enchanted: 2,
      encourage: 2,
      encouraged: 2,
      encouragement: 2,
      encourages: 2,
      encouraging: 2,
      endorse: 2,
      endorsed: 2,
      endorsement: 2,
      endorses: 2,
      enemies: -2,
      enemy: -2,
      energetic: 2,
      engage: 1,
      engages: 1,
      engrossed: 1,
      engrossing: 3,
      enjoy: 2,
      enjoyable: 2,
      enjoyed: 2,
      enjoying: 2,
      enjoys: 2,
      enlighten: 2,
      enlightened: 2,
      enlightening: 2,
      enlightens: 2,
      ennui: -2,
      enrage: -2,
      enraged: -2,
      enrages: -2,
      enraging: -2,
      enrapture: 3,
      enslave: -2,
      enslaved: -2,
      enslaves: -2,
      ensure: 1,
      ensuring: 1,
      enterprising: 1,
      entertaining: 2,
      enthral: 3,
      enthusiastic: 3,
      entitled: 1,
      entrusted: 2,
      envies: -1,
      envious: -2,
      "environment-friendly": 2,
      envy: -1,
      envying: -1,
      erroneous: -2,
      error: -2,
      errors: -2,
      escape: -1,
      escapes: -1,
      escaping: -1,
      esteem: 2,
      esteemed: 2,
      ethical: 2,
      euphoria: 3,
      euphoric: 4,
      evacuate: -1,
      evacuated: -1,
      evacuates: -1,
      evacuating: -1,
      evacuation: -1,
      evergreen: 2,
      evergreens: 2,
      evergreening: -3,
      eviction: -1,
      evil: -3,
      exacerbate: -2,
      exacerbated: -2,
      exacerbates: -2,
      exacerbating: -2,
      exaggerate: -2,
      exaggerated: -2,
      exaggerates: -2,
      exaggerating: -2,
      exasparate: -2,
      exasperated: -2,
      exasperates: -2,
      exasperating: -2,
      excellence: 3,
      excellent: 3,
      excite: 3,
      excited: 3,
      excitement: 3,
      exciting: 3,
      exclude: -1,
      excluded: -2,
      exclusion: -1,
      exclusive: 2,
      excruciatingly: -1,
      excuse: -1,
      exempt: -1,
      exhausted: -2,
      exhilarated: 3,
      exhilarates: 3,
      exhilarating: 3,
      exonerate: 2,
      exonerated: 2,
      exonerates: 2,
      exonerating: 2,
      expand: 1,
      expands: 1,
      expel: -2,
      expelled: -2,
      expelling: -2,
      expels: -2,
      expertly: 2,
      exploit: -2,
      exploited: -2,
      exploiting: -2,
      exploits: -2,
      exploration: 1,
      explorations: 1,
      expose: -1,
      exposed: -1,
      exposes: -1,
      exposing: -1,
      exquisite: 3,
      extend: 1,
      extends: 1,
      extremist: -2,
      extremists: -2,
      exuberant: 4,
      exultant: 3,
      exultantly: 3,
      fabulous: 4,
      fabulously: 4,
      fad: -2,
      fag: -3,
      faggot: -3,
      faggots: -3,
      fail: -2,
      failed: -2,
      failing: -2,
      fails: -2,
      failure: -2,
      failures: -2,
      fainthearted: -2,
      fair: 2,
      fairness: 2,
      faith: 1,
      faithful: 3,
      fake: -3,
      faker: -3,
      fakes: -3,
      faking: -3,
      fallen: -2,
      falling: -1,
      false: -1,
      falsely: -2,
      falsified: -3,
      falsify: -3,
      fame: 1,
      famine: -2,
      famous: 2,
      fan: 3,
      fantastic: 4,
      farce: -1,
      fascinate: 3,
      fascinated: 3,
      fascinates: 3,
      fascinating: 3,
      fascination: 3,
      fascist: -2,
      fascists: -2,
      fatal: -3,
      fatalities: -3,
      fatality: -3,
      fatigue: -2,
      fatigued: -2,
      fatigues: -2,
      fatiguing: -2,
      favor: 2,
      favorable: 2,
      favorably: 2,
      favored: 2,
      favorite: 2,
      favorited: 2,
      favorites: 2,
      favors: 2,
      favour: 2,
      favourable: 2,
      favourably: 2,
      favoured: 2,
      favourite: 2,
      favourited: 2,
      favourites: 2,
      favours: 2,
      fear: -2,
      fearful: -2,
      fearfully: -2,
      fearing: -2,
      fearless: 2,
      fearlessness: 2,
      fearsome: -2,
      "fed up": -3,
      feeble: -2,
      feeling: 1,
      felonies: -3,
      felony: -3,
      fertile: 2,
      fervent: 2,
      fervid: 2,
      festive: 2,
      fever: -2,
      fiasco: -3,
      fidgety: -2,
      fight: -1,
      fighting: -2,
      fine: 2,
      fines: -2,
      finest: 3,
      fire: -2,
      fired: -2,
      firing: -2,
      fit: 1,
      fitness: 1,
      filth: -2,
      filthy: -2,
      flagship: 2,
      flaw: -2,
      flawed: -3,
      flawless: 2,
      flawlessly: 2,
      flaws: -2,
      flees: -1,
      flop: -2,
      flops: -2,
      flu: -2,
      flustered: -2,
      focused: 2,
      fond: 2,
      fondness: 2,
      fool: -2,
      foolish: -2,
      fools: -2,
      forbid: -1,
      forbidden: -2,
      forbidding: -2,
      forced: -1,
      foreclosure: -2,
      foreclosures: -2,
      forefront: 1,
      forget: -1,
      forgetful: -2,
      forgettable: -1,
      forgive: 1,
      forgiving: 1,
      forgot: -1,
      forgotten: -1,
      fortune: 2,
      fortunate: 2,
      fortunately: 2,
      foul: -3,
      frantic: -1,
      fraud: -4,
      frauds: -4,
      fraudster: -4,
      fraudsters: -4,
      fraudulence: -4,
      fraudulent: -4,
      freak: -2,
      free: 1,
      freedom: 2,
      freedoms: 2,
      frenzy: -3,
      fresh: 1,
      friend: 1,
      friendliness: 2,
      friendly: 2,
      friendship: 2,
      fright: -2,
      frightened: -2,
      frightening: -3,
      frikin: -2,
      frisky: 2,
      frowning: -1,
      fruitless: -2,
      frustrate: -2,
      frustrated: -2,
      frustrates: -2,
      frustrating: -2,
      frustration: -2,
      ftw: 3,
      fuck: -4,
      fucked: -4,
      fucker: -4,
      fuckers: -4,
      fuckface: -4,
      fuckhead: -4,
      fuckin: -4,
      fucking: -4,
      "fucking amazing": 4,
      "fucking beautiful": 4,
      "fucking cute": 4,
      "fucking fantastic": 4,
      "fucking good": 4,
      "fucking great": 4,
      "fucking hot": 2,
      "fucking love": 4,
      "fucking loves": 4,
      "fucking perfect": 4,
      fucktard: -4,
      fud: -3,
      fuked: -4,
      fuking: -4,
      fulfill: 2,
      fulfilled: 2,
      fulfillment: 2,
      fulfills: 2,
      fuming: -2,
      fun: 4,
      funeral: -1,
      funerals: -1,
      funky: 2,
      funnier: 4,
      funny: 4,
      furious: -3,
      futile: -2,
      gag: -2,
      gagged: -2,
      gain: 2,
      gained: 2,
      gaining: 2,
      gains: 2,
      gallant: 3,
      gallantly: 3,
      gallantry: 3,
      "game-changing": 3,
      garbage: -1,
      gem: 3,
      generous: 2,
      generously: 2,
      genial: 3,
      ghastly: -2,
      ghost: -1,
      giddy: -2,
      gift: 2,
      glad: 3,
      glamorous: 3,
      glamourous: 3,
      glee: 3,
      gleeful: 3,
      gloom: -1,
      gloomy: -2,
      glorious: 2,
      glory: 2,
      glum: -2,
      god: 1,
      goddamn: -3,
      godsend: 4,
      gold: 2,
      good: 3,
      goodlooking: 3,
      goodmorning: 1,
      goodness: 3,
      goodwill: 3,
      goofiness: -2,
      goofy: -2,
      grace: 1,
      graceful: 2,
      gracious: 3,
      grand: 3,
      grant: 1,
      granted: 1,
      granting: 1,
      grants: 1,
      grateful: 3,
      gratification: 2,
      grave: -2,
      gray: -1,
      grisly: -2,
      gr8: 3,
      great: 3,
      greater: 3,
      greatest: 3,
      greed: -3,
      greedy: -2,
      "green wash": -3,
      "green washing": -3,
      greenwash: -3,
      greenwasher: -3,
      greenwashers: -3,
      greenwashing: -3,
      greet: 1,
      greeted: 1,
      greeting: 1,
      greetings: 2,
      greets: 1,
      grey: -1,
      grief: -2,
      grieved: -2,
      grim: -2,
      gripping: 2,
      groan: -2,
      groaned: -2,
      groaning: -2,
      groans: -2,
      gross: -2,
      growing: 1,
      growth: 2,
      growths: 2,
      gruesome: -3,
      guarantee: 1,
      guilt: -3,
      guilty: -3,
      gullibility: -2,
      gullible: -2,
      gun: -1,
      ha: 2,
      hacked: -1,
      haha: 3,
      hahaha: 3,
      hahahah: 3,
      hail: 2,
      hailed: 2,
      hallelujah: 3,
      handpicked: 1,
      handsome: 3,
      hapless: -2,
      haplessness: -2,
      happiest: 3,
      happiness: 3,
      happy: 3,
      harass: -3,
      harassed: -3,
      harasses: -3,
      harassing: -3,
      harassment: -3,
      hard: -1,
      hardier: 2,
      hardship: -2,
      hardy: 2,
      harm: -2,
      harmed: -2,
      harmful: -2,
      harming: -2,
      harmony: 2,
      harmonious: 2,
      harmoniously: 2,
      harms: -2,
      harried: -2,
      harsh: -2,
      harsher: -2,
      harshest: -2,
      harshly: -2,
      hate: -3,
      hated: -3,
      hater: -3,
      haters: -3,
      hates: -3,
      hating: -3,
      hatred: -3,
      haunt: -1,
      haunted: -2,
      haunting: 1,
      haunts: -1,
      havoc: -2,
      hazardous: -3,
      headache: -2,
      healthy: 2,
      heartbreaking: -3,
      heartbroken: -3,
      heartfelt: 3,
      heartless: -2,
      heartwarming: 3,
      heaven: 2,
      heavenly: 4,
      heavyhearted: -2,
      hehe: 2,
      hell: -4,
      hellish: -2,
      help: 2,
      helpful: 2,
      helping: 2,
      helpless: -2,
      helps: 2,
      hero: 2,
      heroes: 2,
      heroic: 3,
      hesitant: -2,
      hesitate: -2,
      hid: -1,
      hide: -1,
      hideous: -3,
      hides: -1,
      hiding: -1,
      highlight: 2,
      hilarious: 2,
      hinder: -2,
      hindrance: -2,
      hoax: -2,
      hollow: -1,
      homeless: -2,
      homesick: -2,
      homicide: -2,
      homicides: -2,
      honest: 2,
      honor: 2,
      honored: 2,
      honoring: 2,
      honour: 2,
      honoured: 2,
      honouring: 2,
      hooligan: -2,
      hooliganism: -2,
      hooligans: -2,
      hope: 2,
      hopeful: 2,
      hopefully: 2,
      hopeless: -2,
      hopelessness: -2,
      hopes: 2,
      hoping: 2,
      horrendous: -3,
      horrid: -3,
      horrible: -3,
      horrific: -3,
      horrified: -3,
      hospitalized: -2,
      hostile: -2,
      huckster: -2,
      hug: 2,
      huge: 1,
      hugs: 2,
      humane: 2,
      humble: 1,
      humbug: -2,
      humerous: 3,
      humiliated: -3,
      humiliation: -3,
      humor: 2,
      humorous: 2,
      humour: 2,
      humourous: 2,
      hunger: -2,
      hurrah: 5,
      hurt: -2,
      hurting: -2,
      hurts: -2,
      hypocritical: -2,
      hysteria: -3,
      hysterical: -3,
      hysterics: -3,
      icky: -3,
      idiocy: -3,
      idiot: -3,
      idiotic: -3,
      ignorance: -2,
      ignorant: -2,
      ignore: -1,
      ignored: -2,
      ignores: -1,
      ill: -2,
      "ill-fated": -2,
      illegal: -3,
      illegally: -3,
      illegitimate: -3,
      illiteracy: -2,
      illness: -2,
      illnesses: -2,
      illogical: -2,
      imaginative: 2,
      imbecile: -3,
      immobilized: -1,
      immortal: 2,
      immune: 1,
      impair: -2,
      impaired: -2,
      impairing: -2,
      impairment: -2,
      impairs: -2,
      impatient: -2,
      impeachment: -3,
      impeachments: -3,
      impede: -2,
      impeded: -2,
      impedes: -2,
      impeding: -2,
      impedingly: -2,
      imperfect: -2,
      importance: 2,
      important: 2,
      impose: -1,
      imposed: -1,
      imposes: -1,
      imposing: -1,
      imposter: -2,
      impotent: -2,
      impress: 3,
      impressed: 3,
      impresses: 3,
      impressive: 3,
      imprisoned: -2,
      imprisonment: -2,
      improper: -2,
      improperly: -2,
      improve: 2,
      improved: 2,
      improvement: 2,
      improves: 2,
      improving: 2,
      inability: -2,
      inaction: -2,
      inadequate: -2,
      inadvertently: -2,
      inappropriate: -2,
      incapable: -2,
      incapacitated: -2,
      incapacitates: -2,
      incapacitating: -2,
      incense: -2,
      incensed: -2,
      incenses: -2,
      incensing: -2,
      incoherent: -2,
      incompetence: -2,
      incompetent: -2,
      incomplete: -1,
      incomprehensible: -2,
      inconsiderate: -2,
      inconvenience: -2,
      inconvenient: -2,
      increase: 1,
      increased: 1,
      indecisive: -2,
      indestructible: 2,
      indicted: -2,
      indifference: -2,
      indifferent: -2,
      indignant: -2,
      indignation: -2,
      indoctrinate: -2,
      indoctrinated: -2,
      indoctrinates: -2,
      indoctrinating: -2,
      inediable: -2,
      inexorable: -3,
      inexcusable: -3,
      ineffective: -2,
      ineffectively: -2,
      ineffectual: -2,
      inefficiency: -2,
      inefficient: -2,
      inefficiently: -2,
      inept: -2,
      ineptitude: -2,
      infantile: -2,
      infantilized: -2,
      infatuated: 2,
      infatuation: 2,
      infect: -2,
      infected: -2,
      infecting: -2,
      infection: -2,
      infections: -2,
      infectious: -2,
      infects: -2,
      inferior: -2,
      infest: -2,
      infested: -2,
      infesting: -2,
      infests: -2,
      inflamed: -2,
      inflict: -2,
      inflicted: -2,
      inflicting: -2,
      inflicts: -2,
      influential: 2,
      infract: -2,
      infracted: -2,
      infracting: -2,
      infracts: -2,
      infringement: -2,
      infuriate: -2,
      infuriated: -2,
      infuriates: -2,
      infuriating: -2,
      inhibit: -1,
      inhuman: -2,
      injured: -2,
      injuries: -2,
      injury: -2,
      injustice: -2,
      innovate: 1,
      innovates: 1,
      innovation: 1,
      innovative: 2,
      inoperative: -2,
      inquisition: -2,
      inquisitive: 2,
      insane: -2,
      insanity: -2,
      insecure: -2,
      insensitive: -2,
      insensitivity: -2,
      insignificant: -2,
      insipid: -2,
      insolvent: -2,
      insomnia: -2,
      inspiration: 2,
      inspirational: 2,
      inspire: 2,
      inspired: 2,
      inspires: 2,
      inspiring: 3,
      insufficiency: -2,
      insufficient: -2,
      insufficiently: -2,
      insult: -2,
      insulted: -2,
      insulting: -2,
      insults: -2,
      intact: 2,
      integrity: 2,
      intelligent: 2,
      intense: 1,
      interest: 1,
      interested: 2,
      interesting: 2,
      interests: 1,
      interrogated: -2,
      interrupt: -2,
      interrupted: -2,
      interrupting: -2,
      interruption: -2,
      interrupts: -2,
      intimacy: 2,
      intimidate: -2,
      intimidated: -2,
      intimidates: -2,
      intimidating: -2,
      intimidation: -2,
      intransigence: -2,
      intransigency: -2,
      intricate: 2,
      intrigues: 1,
      invasion: -1,
      invincible: 2,
      invite: 1,
      inviting: 1,
      invulnerable: 2,
      irate: -3,
      ironic: -1,
      irony: -1,
      irrational: -1,
      irreparable: -2,
      irreproducible: -2,
      irresistible: 2,
      irresistibly: 2,
      irresolute: -2,
      irresponsible: -2,
      irresponsibly: -2,
      irreversible: -1,
      irreversibly: -1,
      irritate: -3,
      irritated: -3,
      irritates: -3,
      irritating: -3,
      isolated: -1,
      itchy: -2,
      jackass: -4,
      jackasses: -4,
      jailed: -2,
      jaunty: 2,
      jealous: -2,
      jealousy: -2,
      jeopardy: -2,
      jerk: -3,
      jesus: 1,
      jewel: 1,
      jewels: 1,
      jocular: 2,
      join: 1,
      joke: 2,
      jokes: 2,
      jolly: 2,
      jovial: 2,
      joy: 3,
      joyful: 3,
      joyfully: 3,
      joyless: -2,
      joyous: 3,
      jubilant: 3,
      jumpy: -1,
      justice: 2,
      justifiably: 2,
      justified: 2,
      keen: 1,
      kickback: -3,
      kickbacks: -3,
      kidnap: -2,
      kidnapped: -2,
      kidnapping: -2,
      kidnappings: -2,
      kidnaps: -2,
      kill: -3,
      killed: -3,
      killing: -3,
      kills: -3,
      kind: 2,
      "kind of": 0,
      kinder: 2,
      kindness: 2,
      kiss: 2,
      kudos: 3,
      lack: -2,
      lackadaisical: -2,
      lag: -1,
      lagged: -2,
      lagging: -2,
      lags: -2,
      lame: -2,
      landmark: 2,
      lapse: -1,
      lapsed: -1,
      laugh: 1,
      laughed: 1,
      laughing: 1,
      laughs: 1,
      laughting: 1,
      launched: 1,
      lawl: 3,
      lawsuit: -2,
      lawsuits: -2,
      lazy: -1,
      leadership: 1,
      leading: 2,
      leak: -1,
      leaked: -1,
      leave: -1,
      legal: 1,
      legally: 1,
      lenient: 1,
      lethal: -2,
      lethality: -2,
      lethargic: -2,
      lethargy: -2,
      liar: -3,
      liars: -3,
      libelous: -2,
      lied: -2,
      lifeless: -1,
      lifesaver: 4,
      lighthearted: 1,
      likable: 2,
      like: 2,
      likeable: 2,
      liked: 2,
      likers: 2,
      likes: 2,
      liking: 2,
      limitation: -1,
      limited: -1,
      limits: -1,
      litigation: -1,
      litigious: -2,
      lively: 2,
      livid: -2,
      lmao: 4,
      lmfao: 4,
      loathe: -3,
      loathed: -3,
      loathes: -3,
      loathing: -3,
      loathsome: -3,
      lobbied: -2,
      lobby: -2,
      lobbying: -2,
      lobbyist: -2,
      lobbyists: -2,
      lol: 3,
      lolol: 4,
      lololol: 4,
      lolololol: 4,
      lonely: -2,
      lonesome: -2,
      longing: -1,
      lool: 3,
      loom: -1,
      loomed: -1,
      looming: -1,
      looms: -1,
      loool: 3,
      looool: 3,
      loose: -3,
      looses: -3,
      loser: -3,
      losing: -3,
      loss: -3,
      losses: -3,
      lost: -3,
      lousy: -2,
      lovable: 3,
      love: 3,
      loved: 3,
      lovelies: 3,
      lovely: 3,
      loves: 3,
      loving: 2,
      "loving-kindness": 3,
      lowest: -1,
      loyal: 3,
      loyalty: 3,
      luck: 3,
      luckily: 3,
      lucky: 3,
      lucrative: 3,
      ludicrous: -3,
      lugubrious: -2,
      lunatic: -3,
      lunatics: -3,
      lurk: -1,
      lurking: -1,
      lurks: -1,
      luxury: 2,
      macabre: -2,
      mad: -3,
      maddening: -3,
      "made-up": -1,
      madly: -3,
      madness: -3,
      magnificent: 3,
      maladaption: -2,
      maldevelopment: -2,
      maltreatment: -2,
      mandatory: -1,
      manipulated: -1,
      manipulating: -1,
      manipulation: -1,
      manslaughter: -3,
      marvel: 3,
      marvelous: 3,
      marvels: 3,
      masterpiece: 4,
      masterpieces: 4,
      matter: 1,
      matters: 1,
      mature: 2,
      meaningful: 2,
      meaningless: -2,
      medal: 3,
      mediocrity: -3,
      meditative: 1,
      melancholy: -2,
      memorable: 1,
      memoriam: -2,
      menace: -2,
      menaced: -2,
      menaces: -2,
      mercy: 2,
      merry: 3,
      mesmerizing: 3,
      mess: -2,
      messed: -2,
      "messing up": -2,
      methodical: 2,
      methodically: 2,
      mindless: -2,
      miracle: 4,
      mirth: 3,
      mirthful: 3,
      mirthfully: 3,
      misbehave: -2,
      misbehaved: -2,
      misbehaves: -2,
      misbehaving: -2,
      misbranding: -3,
      miscast: -2,
      mischief: -1,
      mischiefs: -1,
      misclassified: -2,
      misclassifies: -2,
      misclassify: -2,
      misconduct: -2,
      misconducted: -2,
      misconducting: -2,
      misconducts: -2,
      miserable: -3,
      miserably: -3,
      misery: -2,
      misfire: -2,
      misfortune: -2,
      misgiving: -2,
      misinformation: -2,
      misinformed: -2,
      misinterpreted: -2,
      mislead: -3,
      misleaded: -3,
      misleading: -3,
      misleads: -3,
      misplace: -2,
      misplaced: -2,
      misplaces: -2,
      misplacing: -2,
      mispricing: -3,
      misread: -1,
      misreport: -2,
      misreported: -2,
      misreporting: -2,
      misreports: -2,
      misrepresent: -2,
      misrepresentation: -2,
      misrepresentations: -2,
      misrepresented: -2,
      misrepresenting: -2,
      misrepresents: -2,
      miss: -2,
      missed: -2,
      missing: -2,
      mistake: -2,
      mistaken: -2,
      mistakes: -2,
      mistaking: -2,
      misunderstand: -2,
      misunderstanding: -2,
      misunderstands: -2,
      misunderstood: -2,
      misuse: -2,
      misused: -2,
      misuses: -2,
      misusing: -2,
      moan: -2,
      moaned: -2,
      moaning: -2,
      moans: -2,
      mock: -2,
      mocked: -2,
      mocking: -2,
      mocks: -2,
      modernize: 2,
      modernized: 2,
      modernizes: 2,
      modernizing: 2,
      mongering: -2,
      monopolize: -2,
      monopolized: -2,
      monopolizes: -2,
      monopolizing: -2,
      monotone: -1,
      moody: -1,
      mope: -1,
      moping: -1,
      moron: -3,
      motherfucker: -5,
      motherfucking: -5,
      motivate: 1,
      motivated: 2,
      motivating: 2,
      motivation: 1,
      mourn: -2,
      mourned: -2,
      mournful: -2,
      mourning: -2,
      mourns: -2,
      muddy: -2,
      mumpish: -2,
      murder: -2,
      murderer: -2,
      murdering: -3,
      murderous: -3,
      murders: -2,
      murky: -2,
      myth: -1,
      n00b: -2,
      naive: -2,
      narcissism: -2,
      nasty: -3,
      natural: 1,
      na\u00EFve: -2,
      needy: -2,
      negative: -2,
      negativity: -2,
      neglect: -2,
      neglected: -2,
      neglecting: -2,
      neglects: -2,
      nerves: -1,
      nervous: -2,
      nervously: -2,
      nice: 3,
      nifty: 2,
      niggas: -5,
      nigger: -5,
      no: -1,
      "no fun": -3,
      noble: 2,
      noblest: 2,
      noisy: -1,
      "non-approved": -2,
      nonsense: -2,
      noob: -2,
      nosey: -2,
      "not good": -2,
      "not working": -3,
      notable: 2,
      noticeable: 2,
      notorious: -2,
      novel: 2,
      numb: -1,
      nurturing: 2,
      nuts: -3,
      obliterate: -2,
      obliterated: -2,
      obnoxious: -3,
      obscene: -2,
      obscenity: -2,
      obsessed: 2,
      obsolete: -2,
      obstacle: -2,
      obstacles: -2,
      obstinate: -2,
      obstruct: -2,
      obstructed: -2,
      obstructing: -2,
      obstruction: -2,
      obstructs: -2,
      odd: -2,
      offence: -2,
      offences: -2,
      offend: -2,
      offended: -2,
      offender: -2,
      offending: -2,
      offends: -2,
      offense: -2,
      offenses: -2,
      offensive: -2,
      offensively: -2,
      offline: -1,
      oks: 2,
      ominous: 3,
      "once-in-a-lifetime": 3,
      oops: -2,
      opportunities: 2,
      opportunity: 2,
      oppressed: -2,
      oppression: -2,
      oppressions: -2,
      oppressive: -2,
      optimism: 2,
      optimistic: 2,
      optionless: -2,
      ostracize: -2,
      ostracized: -2,
      ostracizes: -2,
      ouch: -2,
      outage: -2,
      outages: -2,
      outbreak: -2,
      outbreaks: -2,
      outcry: -2,
      outmaneuvered: -2,
      outnumbered: -2,
      outrage: -3,
      outraged: -3,
      outrageous: -3,
      outreach: 2,
      outstanding: 5,
      overjoyed: 4,
      overload: -1,
      overlooked: -1,
      overprotective: -2,
      overran: -2,
      overreact: -2,
      overreacted: -2,
      overreacting: -2,
      overreaction: -2,
      overreacts: -2,
      oversell: -2,
      overselling: -2,
      oversells: -2,
      oversight: -1,
      oversimplification: -2,
      oversimplified: -2,
      oversimplifies: -2,
      oversimplify: -2,
      oversold: -2,
      overstatement: -2,
      overstatements: -2,
      overweight: -1,
      overwrought: -3,
      oxymoron: -1,
      pain: -2,
      pained: -2,
      painful: -2,
      panic: -3,
      panicked: -3,
      panics: -3,
      paradise: 3,
      paradox: -1,
      pardon: 2,
      pardoned: 2,
      pardoning: 2,
      pardons: 2,
      parley: -1,
      passion: 1,
      passionate: 2,
      passive: -1,
      passively: -1,
      pathetic: -2,
      pay: -1,
      peace: 2,
      peaceful: 2,
      peacefully: 2,
      penalize: -2,
      penalized: -2,
      penalizes: -2,
      penalizing: -2,
      penalty: -2,
      pensive: -1,
      perfect: 3,
      perfected: 2,
      perfection: 3,
      perfectly: 3,
      perfects: 2,
      peril: -2,
      perjury: -3,
      perpetrated: -2,
      perpetrator: -2,
      perpetrators: -2,
      perplexed: -2,
      persecute: -2,
      persecuted: -2,
      persecutes: -2,
      persecuting: -2,
      perturbed: -2,
      pervert: -3,
      pesky: -2,
      pessimism: -2,
      pessimistic: -2,
      petrified: -2,
      philanthropy: 2,
      phobic: -2,
      picturesque: 2,
      pileup: -1,
      pillage: -2,
      pique: -2,
      piqued: -2,
      piss: -4,
      pissed: -4,
      pissing: -3,
      piteous: -2,
      pitied: -1,
      pity: -2,
      plague: -3,
      plagued: -3,
      plagues: -3,
      plaguing: -3,
      playful: 2,
      pleasant: 3,
      please: 1,
      pleased: 3,
      pleasurable: 3,
      pleasure: 3,
      plodding: -2,
      poignant: 2,
      pointless: -2,
      poised: -2,
      poison: -2,
      poisoned: -2,
      poisons: -2,
      polished: 2,
      polite: 2,
      politeness: 2,
      pollutant: -2,
      pollute: -2,
      polluted: -2,
      polluter: -2,
      polluters: -2,
      pollutes: -2,
      pollution: -2,
      poor: -2,
      poorer: -2,
      poorest: -2,
      poorly: -2,
      popular: 3,
      popularity: 3,
      positive: 2,
      positively: 2,
      possessive: -2,
      "post-traumatic": -2,
      postpone: -1,
      postponed: -1,
      postpones: -1,
      postponing: -1,
      poverty: -1,
      powerful: 2,
      powerless: -2,
      praise: 3,
      praised: 3,
      praises: 3,
      praising: 3,
      pray: 1,
      praying: 1,
      prays: 1,
      prblm: -2,
      prblms: -2,
      predatory: -2,
      prepared: 1,
      pressure: -1,
      pressured: -2,
      pretend: -1,
      pretending: -1,
      pretends: -1,
      pretty: 1,
      prevent: -1,
      prevented: -1,
      preventing: -1,
      prevents: -1,
      prick: -5,
      prison: -2,
      prisoner: -2,
      prisoners: -2,
      privileged: 2,
      proactive: 2,
      problem: -2,
      problems: -2,
      profit: 2,
      profitable: 2,
      profiteer: -2,
      profits: 2,
      progress: 2,
      prohibit: -1,
      prohibits: -1,
      prominent: 2,
      promise: 1,
      promised: 1,
      promises: 1,
      promote: 1,
      promoted: 1,
      promotes: 1,
      promoting: 1,
      promptly: 1,
      propaganda: -2,
      prosecute: -1,
      prosecuted: -2,
      prosecutes: -1,
      prosecution: -1,
      prospect: 1,
      prospects: 1,
      prosperity: 3,
      prosperous: 3,
      protect: 1,
      protected: 1,
      protects: 1,
      protest: -2,
      protesters: -2,
      protesting: -2,
      protests: -2,
      proud: 2,
      proudly: 2,
      provoke: -1,
      provoked: -1,
      provokes: -1,
      provoking: -1,
      prudence: 2,
      pseudoscience: -3,
      psychopathic: -2,
      punish: -2,
      punished: -2,
      punishes: -2,
      punishing: -2,
      punitive: -2,
      pure: 1,
      purest: 1,
      purposeful: 2,
      pushy: -1,
      puzzled: -2,
      quaking: -2,
      qualities: 2,
      quality: 2,
      questionable: -2,
      questioned: -1,
      questioning: -1,
      racism: -3,
      racist: -3,
      racists: -3,
      rage: -2,
      rageful: -2,
      rainy: -1,
      rant: -3,
      ranter: -3,
      ranters: -3,
      rants: -3,
      rape: -4,
      raped: -4,
      rapist: -4,
      rapture: 2,
      raptured: 2,
      raptures: 2,
      rapturous: 4,
      rash: -2,
      ratified: 2,
      reach: 1,
      reached: 1,
      reaches: 1,
      reaching: 1,
      reassure: 1,
      reassured: 1,
      reassures: 1,
      reassuring: 2,
      rebel: -2,
      rebellion: -2,
      rebels: -2,
      recession: -2,
      reckless: -2,
      recognition: 2,
      recommend: 2,
      recommended: 2,
      recommends: 2,
      redeemed: 2,
      refine: 1,
      refined: 1,
      refines: 1,
      refreshingly: 2,
      refuse: -2,
      refused: -2,
      refuses: -2,
      refusing: -2,
      regret: -2,
      regretful: -2,
      regrets: -2,
      regretted: -2,
      regretting: -2,
      reigning: 1,
      reject: -1,
      rejected: -1,
      rejecting: -1,
      rejection: -2,
      rejects: -1,
      rejoice: 4,
      rejoiced: 4,
      rejoices: 4,
      rejoicing: 4,
      relaxed: 2,
      relentless: -1,
      reliability: 2,
      reliable: 2,
      reliably: 2,
      reliant: 2,
      relieve: 1,
      relieved: 2,
      relieves: 1,
      relieving: 2,
      relishing: 2,
      remarkable: 2,
      remorse: -2,
      repellent: -2,
      repercussion: -2,
      repercussions: -2,
      reprimand: -2,
      reprimanded: -2,
      reprimanding: -2,
      reprimands: -2,
      repulse: -1,
      repulsed: -2,
      repulsive: -2,
      rescue: 2,
      rescued: 2,
      rescues: 2,
      resentful: -2,
      resign: -1,
      resigned: -1,
      resigning: -1,
      resigns: -1,
      resolute: 2,
      resolution: 2,
      resolve: 2,
      resolved: 2,
      resolves: 2,
      resolving: 2,
      respect: 2,
      respected: 2,
      respects: 2,
      responsibility: 1,
      responsible: 2,
      responsive: 2,
      restful: 2,
      restless: -2,
      restore: 1,
      restored: 1,
      restores: 1,
      restoring: 1,
      restrict: -2,
      restricted: -2,
      restricting: -2,
      restriction: -2,
      restrictive: -1,
      restricts: -2,
      retained: -1,
      retard: -2,
      retarded: -2,
      retreat: -1,
      revenge: -2,
      revengeful: -2,
      revered: 2,
      revive: 2,
      revives: 2,
      revolting: -2,
      reward: 2,
      rewarded: 2,
      rewarding: 2,
      rewards: 2,
      rich: 2,
      richly: 2,
      ridiculous: -3,
      rig: -1,
      rigged: -1,
      "right direction": 3,
      righteousness: 2,
      rightful: 2,
      rightfully: 2,
      rigorous: 3,
      rigorously: 3,
      riot: -2,
      riots: -2,
      rise: 1,
      rises: 1,
      risk: -2,
      risks: -2,
      risky: -2,
      riveting: 3,
      rob: -2,
      robber: -2,
      robed: -2,
      robing: -2,
      robs: -2,
      robust: 2,
      rofl: 4,
      roflcopter: 4,
      roflmao: 4,
      romance: 2,
      romantical: 2,
      romantically: 2,
      rose: 1,
      rotfl: 4,
      rotflmfao: 4,
      rotflol: 4,
      rotten: -3,
      rude: -2,
      ruin: -2,
      ruined: -2,
      ruining: -2,
      ruins: -2,
      sabotage: -2,
      sad: -2,
      sadden: -2,
      saddened: -2,
      sadly: -2,
      safe: 1,
      safely: 1,
      safer: 2,
      safety: 1,
      salient: 1,
      salute: 2,
      saluted: 2,
      salutes: 2,
      saluting: 2,
      salvation: 2,
      sappy: -1,
      sarcastic: -2,
      satisfied: 2,
      savange: -2,
      savanges: -2,
      save: 2,
      saved: 2,
      savings: 1,
      scam: -2,
      scams: -2,
      scandal: -3,
      scandalous: -3,
      scandals: -3,
      scapegoat: -2,
      scapegoats: -2,
      scare: -2,
      scared: -2,
      scar: -2,
      scars: -2,
      scary: -2,
      sceptical: -2,
      scold: -2,
      scoop: 3,
      scorn: -2,
      scornful: -2,
      scream: -2,
      screamed: -2,
      screaming: -2,
      screams: -2,
      screwed: -2,
      "screwed up": -3,
      scum: -3,
      scumbag: -4,
      seamless: 2,
      seamlessly: 2,
      secure: 2,
      secured: 2,
      secures: 2,
      sedition: -2,
      seditious: -2,
      seduced: -1,
      "self-abuse": -2,
      "self-confident": 2,
      "self-contradictory": -2,
      "self-deluded": -2,
      selfish: -3,
      selfishness: -3,
      sentence: -2,
      sentenced: -2,
      sentences: -2,
      sentencing: -2,
      serene: 2,
      settlement: 1,
      settlements: 1,
      severe: -2,
      severely: -2,
      sexist: -2,
      sexistic: -2,
      sexy: 3,
      shaky: -2,
      shame: -2,
      shamed: -2,
      shameful: -2,
      share: 1,
      shared: 1,
      shares: 1,
      shattered: -2,
      shit: -4,
      shithead: -4,
      shitty: -3,
      shock: -2,
      shocked: -2,
      shocking: -2,
      shocks: -2,
      shoody: -2,
      shoot: -1,
      "short-sighted": -2,
      "short-sightedness": -2,
      shortage: -2,
      shortages: -2,
      shrew: -4,
      shy: -1,
      sick: -2,
      sickness: -2,
      "side-effect": -2,
      "side-effects": -2,
      sigh: -2,
      significance: 1,
      significant: 1,
      silencing: -1,
      silly: -1,
      simplicity: 1,
      sin: -2,
      sincere: 2,
      sincerely: 2,
      sincerest: 2,
      sincerity: 2,
      sinful: -3,
      singleminded: -2,
      sinister: -2,
      sins: -2,
      skeptic: -2,
      skeptical: -2,
      skepticism: -2,
      skeptics: -2,
      slam: -2,
      slash: -2,
      slashed: -2,
      slashes: -2,
      slashing: -2,
      slave: -3,
      slavery: -3,
      slaves: -3,
      sleeplessness: -2,
      slick: 2,
      slicker: 2,
      slickest: 2,
      slip: -1,
      sloppy: -2,
      sluggish: -2,
      slumping: -1,
      slut: -5,
      smart: 1,
      smarter: 2,
      smartest: 2,
      smear: -2,
      smile: 2,
      smiled: 2,
      smiles: 2,
      smiling: 2,
      smog: -2,
      smuggle: -2,
      smuggled: -2,
      smuggling: -2,
      smuggles: -2,
      sneaky: -1,
      sneeze: -2,
      sneezed: -2,
      sneezes: -2,
      sneezing: -2,
      snub: -2,
      snubbed: -2,
      snubbing: -2,
      snubs: -2,
      sobering: 1,
      solemn: -1,
      solid: 2,
      solidarity: 2,
      solidified: 2,
      solidifies: 2,
      solidify: 2,
      solidifying: 2,
      solution: 1,
      solutions: 1,
      solve: 1,
      solved: 1,
      solves: 1,
      solving: 1,
      somber: -2,
      "some kind": 0,
      "son-of-a-bitch": -5,
      soothe: 3,
      soothed: 3,
      soothing: 3,
      sophisticated: 2,
      sore: -1,
      sorrow: -2,
      sorrowful: -2,
      sorry: -1,
      spacious: 1,
      spam: -2,
      spammer: -3,
      spammers: -3,
      spamming: -2,
      spark: 1,
      sparkle: 3,
      sparkles: 3,
      sparkling: 3,
      spearhead: 2,
      speculative: -2,
      spirit: 1,
      spirited: 2,
      spiritless: -2,
      spiteful: -2,
      splendid: 3,
      spoiled: -2,
      spoilt: -2,
      spotless: 2,
      sprightly: 2,
      squander: -2,
      squandered: -2,
      squandering: -2,
      squanders: -2,
      squelched: -1,
      stab: -2,
      stabbed: -2,
      stable: 2,
      stabs: -2,
      stall: -2,
      stalled: -2,
      stalling: -2,
      stamina: 2,
      stampede: -2,
      stank: -2,
      startled: -2,
      startling: 3,
      starve: -2,
      starved: -2,
      starves: -2,
      starving: -2,
      steadfast: 2,
      steal: -2,
      stealing: -2,
      steals: -2,
      stereotype: -2,
      stereotyped: -2,
      stifled: -1,
      stimulate: 1,
      stimulated: 1,
      stimulates: 1,
      stimulating: 2,
      stingy: -2,
      stink: -2,
      stinked: -2,
      stinker: -2,
      stinking: -2,
      stinks: -2,
      stinky: -2,
      stole: -2,
      stolen: -2,
      stop: -1,
      stopped: -1,
      stopping: -1,
      stops: -1,
      stout: 2,
      straight: 1,
      strange: -1,
      strangely: -1,
      strangled: -2,
      strength: 2,
      strengthen: 2,
      strengthened: 2,
      strengthening: 2,
      strengthens: 2,
      strengths: 2,
      stress: -1,
      stressed: -2,
      stressor: -2,
      stressors: -2,
      stricken: -2,
      strike: -1,
      strikers: -2,
      strikes: -1,
      strong: 2,
      stronger: 2,
      strongest: 2,
      struck: -1,
      struggle: -2,
      struggled: -2,
      struggles: -2,
      struggling: -2,
      stubborn: -2,
      stuck: -2,
      stunned: -2,
      stunning: 4,
      stupid: -2,
      stupidity: -3,
      stupidly: -2,
      suave: 2,
      subpoena: -2,
      substantial: 1,
      substantially: 1,
      subversive: -2,
      succeed: 3,
      succeeded: 3,
      succeeding: 3,
      succeeds: 3,
      success: 2,
      successful: 3,
      successfully: 3,
      suck: -3,
      sucks: -3,
      sue: -2,
      sued: -2,
      sueing: -2,
      sues: -2,
      suffer: -2,
      suffered: -2,
      sufferer: -2,
      sufferers: -2,
      suffering: -2,
      suffers: -2,
      suicidal: -2,
      suicide: -2,
      suicides: -2,
      suing: -2,
      suitable: 2,
      suited: 2,
      sulking: -2,
      sulky: -2,
      sullen: -2,
      sunshine: 2,
      super: 3,
      superb: 5,
      superior: 2,
      support: 2,
      supported: 2,
      supporter: 1,
      supporters: 1,
      supporting: 1,
      supportive: 2,
      supports: 2,
      supreme: 4,
      survived: 2,
      surviving: 2,
      survivor: 2,
      suspect: -1,
      suspected: -1,
      suspecting: -1,
      suspects: -1,
      suspend: -1,
      suspended: -1,
      suspicious: -2,
      sustainability: 1,
      sustainable: 2,
      sustainably: 2,
      swear: -2,
      swearing: -2,
      swears: -2,
      sweet: 2,
      sweeter: 3,
      sweetest: 3,
      swift: 2,
      swiftly: 2,
      swindle: -3,
      swindles: -3,
      swindling: -3,
      sympathetic: 2,
      sympathy: 2,
      taint: -2,
      tainted: -2,
      talent: 2,
      tard: -2,
      tarnish: -2,
      tarnished: -2,
      tarnishes: -2,
      tears: -2,
      tender: 2,
      tenderness: 2,
      tense: -2,
      tension: -1,
      terrible: -3,
      terribly: -3,
      terrific: 4,
      terrifically: 4,
      terrified: -3,
      terror: -3,
      terrorist: -2,
      terrorists: -2,
      terrorize: -3,
      terrorized: -3,
      terrorizes: -3,
      thank: 2,
      thankful: 2,
      thanks: 2,
      thorny: -2,
      thoughtful: 2,
      thoughtless: -2,
      threat: -2,
      threaten: -2,
      threatened: -2,
      threatening: -2,
      threatens: -2,
      threats: -2,
      thrilled: 5,
      thwart: -2,
      thwarted: -2,
      thwarting: -2,
      thwarts: -2,
      timid: -2,
      timorous: -2,
      tired: -2,
      tits: -2,
      tolerance: 2,
      tolerant: 2,
      toothless: -2,
      top: 2,
      tops: 2,
      torn: -2,
      torture: -4,
      tortured: -4,
      tortures: -4,
      torturing: -4,
      totalitarian: -2,
      totalitarianism: -2,
      tout: -2,
      touted: -2,
      touting: -2,
      touts: -2,
      toxic: -3,
      tragedies: -2,
      tragedy: -2,
      tragic: -2,
      tranquil: 2,
      transgress: -2,
      transgressed: -2,
      transgresses: -2,
      transgressing: -2,
      trap: -1,
      trapped: -2,
      traps: -1,
      trauma: -3,
      traumatic: -3,
      travesty: -2,
      treason: -3,
      treasonous: -3,
      treasure: 2,
      treasures: 2,
      trembling: -2,
      tremor: -2,
      tremors: -2,
      tremulous: -2,
      tribulation: -2,
      tribute: 2,
      tricked: -2,
      trickery: -2,
      triumph: 4,
      triumphant: 4,
      troll: -2,
      trouble: -2,
      troubled: -2,
      troubles: -2,
      troubling: -2,
      true: 2,
      trust: 1,
      trusted: 2,
      trusts: 1,
      tumor: -2,
      twat: -5,
      tyran: -3,
      tyrannic: -3,
      tyrannical: -3,
      tyrannically: -3,
      tyrans: -3,
      ubiquitous: 2,
      ugh: -2,
      ugliness: -3,
      ugly: -3,
      unable: -2,
      unacceptable: -2,
      unappeasable: -2,
      unappreciated: -2,
      unapproved: -2,
      unattractive: -2,
      unavailable: -1,
      unavailing: -2,
      unaware: -2,
      unbearable: -2,
      unbelievable: -1,
      unbelieving: -1,
      unbiased: 2,
      uncertain: -1,
      unclear: -1,
      uncomfortable: -2,
      unconcerned: -2,
      unconfirmed: -1,
      unconvinced: -1,
      uncredited: -1,
      undecided: -1,
      undercooked: -2,
      underestimate: -1,
      underestimated: -1,
      underestimates: -1,
      underestimating: -1,
      undermine: -2,
      undermined: -2,
      undermines: -2,
      undermining: -2,
      underperform: -2,
      underperformed: -2,
      underperforming: -2,
      underperforms: -2,
      undeserving: -2,
      undesirable: -2,
      uneasy: -2,
      unemployed: -1,
      unemployment: -2,
      unequal: -1,
      unequaled: 2,
      unethical: -2,
      uneventful: -2,
      unfair: -2,
      unfavorable: -2,
      unfit: -2,
      unfitted: -2,
      unfocused: -2,
      unforgivable: -3,
      unforgiving: -2,
      unfulfilled: -2,
      unfunny: -2,
      ungenerous: -2,
      ungrateful: -3,
      unhappy: -2,
      unhappiness: -2,
      unhealthy: -2,
      unhygienic: -2,
      unified: 1,
      unimaginative: -2,
      unimpressed: -2,
      uninspired: -2,
      unintelligent: -2,
      unintentional: -2,
      uninvolving: -2,
      united: 1,
      unjust: -2,
      unlikely: -1,
      unlovable: -2,
      unloved: -2,
      unmatched: 1,
      unmotivated: -2,
      unoriginal: -2,
      unparliamentary: -2,
      unpleasant: -2,
      unpleasantness: -2,
      unprofessional: -2,
      unravel: 1,
      unreleting: -2,
      unresearched: -2,
      unsafe: -2,
      unsatisfied: -2,
      unscientific: -2,
      unsecured: -2,
      unselfish: 2,
      unsettled: -1,
      unsold: -1,
      unsophisticated: -2,
      unsound: -2,
      unstable: -2,
      unstoppable: 2,
      unsuccessful: -2,
      unsuccessfully: -2,
      unsupported: -2,
      unsure: -1,
      untarnished: 2,
      untrue: -2,
      unwanted: -2,
      unworthy: -2,
      uplifting: 2,
      uproar: -3,
      upset: -2,
      upsets: -2,
      upsetting: -2,
      uptight: -2,
      urgent: -1,
      useful: 2,
      usefulness: 2,
      useless: -2,
      uselessness: -2,
      vague: -2,
      validate: 1,
      validated: 1,
      validates: 1,
      validating: 1,
      vapid: -2,
      verdict: -1,
      verdicts: -1,
      vested: 1,
      vexation: -2,
      vexing: -2,
      vibrant: 3,
      vicious: -2,
      victim: -3,
      victimization: -3,
      victimize: -3,
      victimized: -3,
      victimizes: -3,
      victimizing: -3,
      victims: -3,
      victor: 3,
      victors: 3,
      victory: 3,
      victories: 3,
      vigilant: 3,
      vigor: 3,
      vile: -3,
      vindicate: 2,
      vindicated: 2,
      vindicates: 2,
      vindicating: 2,
      violate: -2,
      violated: -2,
      violates: -2,
      violating: -2,
      violation: -2,
      violations: -2,
      violence: -3,
      "violence-related": -3,
      violent: -3,
      violently: -3,
      virtuous: 2,
      virulent: -2,
      vision: 1,
      visionary: 3,
      visioning: 1,
      visions: 1,
      vitality: 3,
      vitamin: 1,
      vitriolic: -3,
      vivacious: 3,
      vividly: 2,
      vociferous: -1,
      vomit: -3,
      vomited: -3,
      vomiting: -3,
      vomits: -3,
      vulnerability: -2,
      vulnerable: -2,
      walkout: -2,
      walkouts: -2,
      wanker: -3,
      want: 1,
      war: -2,
      warfare: -2,
      warm: 1,
      warmhearted: 2,
      warmness: 2,
      warmth: 2,
      warn: -2,
      warned: -2,
      warning: -3,
      warnings: -3,
      warns: -2,
      waste: -1,
      wasted: -2,
      wasting: -2,
      wavering: -1,
      weak: -2,
      weakened: -2,
      weakness: -2,
      weaknesses: -2,
      wealth: 3,
      wealthier: 2,
      wealthy: 2,
      weary: -2,
      weep: -2,
      weeping: -2,
      weird: -2,
      welcome: 2,
      welcomed: 2,
      welcomes: 2,
      "well-being": 2,
      "well-championed": 3,
      "well-developed": 2,
      "well-established": 2,
      "well-focused": 2,
      "well-groomed": 2,
      "well-proportioned": 2,
      whimsical: 1,
      whitewash: -3,
      whore: -4,
      wicked: -2,
      widowed: -1,
      willingness: 2,
      win: 4,
      winner: 4,
      winning: 4,
      wins: 4,
      winwin: 3,
      wisdom: 1,
      wish: 1,
      wishes: 1,
      wishing: 1,
      withdrawal: -3,
      wits: 2,
      woebegone: -2,
      woeful: -3,
      won: 3,
      wonderful: 4,
      wonderfully: 4,
      woo: 3,
      woohoo: 3,
      wooo: 4,
      woow: 4,
      worn: -1,
      worried: -3,
      worries: -3,
      worry: -3,
      worrying: -3,
      worse: -3,
      worsen: -3,
      worsened: -3,
      worsening: -3,
      worsens: -3,
      worshiped: 3,
      worst: -3,
      worth: 2,
      worthless: -2,
      worthy: 2,
      wow: 4,
      wowow: 4,
      wowww: 4,
      wrathful: -3,
      wreck: -2,
      wrenching: -2,
      wrong: -2,
      wrongdoing: -2,
      wrongdoings: -2,
      wronged: -2,
      wrongful: -2,
      wrongfully: -2,
      wrongly: -2,
      wtf: -4,
      wtff: -4,
      wtfff: -4,
      xo: 3,
      xoxo: 3,
      xoxoxo: 4,
      xoxoxoxo: 4,
      yeah: 1,
      yearning: 1,
      yeees: 2,
      yes: 1,
      youthful: 2,
      yucky: -2,
      yummy: 3,
      zealot: -2,
      zealots: -2,
      zealous: 2
    };
  }
});

// node_modules/sentiment/languages/en/negators.json
var require_negators = __commonJS({
  "node_modules/sentiment/languages/en/negators.json"(exports, module) {
    module.exports = {
      cant: 1,
      "can't": 1,
      dont: 1,
      "don't": 1,
      doesnt: 1,
      "doesn't": 1,
      not: 1,
      non: 1,
      wont: 1,
      "won't": 1,
      isnt: 1,
      "isn't": 1
    };
  }
});

// node_modules/sentiment/languages/en/scoring-strategy.js
var require_scoring_strategy = __commonJS({
  "node_modules/sentiment/languages/en/scoring-strategy.js"(exports, module) {
    var negators = require_negators();
    module.exports = {
      apply: function(tokens, cursor, tokenScore) {
        if (cursor > 0) {
          var prevtoken = tokens[cursor - 1];
          if (negators[prevtoken]) {
            tokenScore = -tokenScore;
          }
        }
        return tokenScore;
      }
    };
  }
});

// node_modules/sentiment/languages/en/index.js
var require_en = __commonJS({
  "node_modules/sentiment/languages/en/index.js"(exports, module) {
    module.exports = {
      labels: require_labels(),
      scoringStrategy: require_scoring_strategy()
    };
  }
});

// node_modules/sentiment/lib/language-processor.js
var require_language_processor = __commonJS({
  "node_modules/sentiment/lib/language-processor.js"(exports, module) {
    init_();
    var emojis = require_emoji();
    var enLanguage = require_en();
    Object.assign(enLanguage.labels, emojis);
    var languages = {
      en: enLanguage
    };
    module.exports = {
      /**
       * Registers the specified language
       *
       * @param {String} languageCode
       *     - Two-digit code for the language to register
       * @param {Object} language
       *     - The language module to register
       */
      addLanguage: function(languageCode, language) {
        if (!language.labels) {
          throw new Error("language.labels must be defined!");
        }
        Object.assign(language.labels, emojis);
        languages[languageCode] = language;
      },
      /**
       * Retrieves a language object from the cache,
       * or tries to load it from the set of supported languages
       *
       * @param {String} languageCode - Two-digit code for the language to fetch
       */
      getLanguage: function(languageCode) {
        if (!languageCode) {
          return languages.en;
        }
        if (!languages[languageCode]) {
          try {
            var language = globRequire_languages_index("../languages/" + languageCode + "/index");
            this.addLanguage(languageCode, language);
          } catch (err) {
            throw new Error("No language found: " + languageCode);
          }
        }
        return languages[languageCode];
      },
      /**
       * Returns AFINN-165 weighted labels for the specified language
       *
       * @param {String} languageCode - Two-digit language code
       * @return {Object}
       */
      getLabels: function(languageCode) {
        var language = this.getLanguage(languageCode);
        return language.labels;
      },
      /**
       * Applies a scoring strategy for the current token
       *
       * @param {String} languageCode - Two-digit language code
       * @param {Array} tokens - Tokens of the phrase to analyze
       * @param {int} cursor - Cursor of the current token being analyzed
       * @param {int} tokenScore - The score of the current token being analyzed
       */
      applyScoringStrategy: function(languageCode, tokens, cursor, tokenScore) {
        var language = this.getLanguage(languageCode);
        var scoringStrategy = language.scoringStrategy || defaultScoringStrategy;
        return scoringStrategy.apply(tokens, cursor, tokenScore);
      }
    };
    var defaultScoringStrategy = {
      apply: function(tokens, cursor, tokenScore) {
        return tokenScore;
      }
    };
  }
});

// node_modules/sentiment/lib/index.js
var require_lib = __commonJS({
  "node_modules/sentiment/lib/index.js"(exports, module) {
    var tokenize = require_tokenize();
    var languageProcessor = require_language_processor();
    var Sentiment = function(options) {
      this.options = options;
    };
    Sentiment.prototype.registerLanguage = function(languageCode, language) {
      languageProcessor.addLanguage(languageCode, language);
    };
    Sentiment.prototype.analyze = function(phrase, opts, callback) {
      if (typeof phrase === "undefined") phrase = "";
      if (typeof opts === "function") {
        callback = opts;
        opts = {};
      }
      opts = opts || {};
      var languageCode = opts.language || "en";
      var labels = languageProcessor.getLabels(languageCode);
      if (typeof opts.extras === "object") {
        labels = Object.assign(labels, opts.extras);
      }
      var tokens = tokenize(phrase), score = 0, words = [], positive = [], negative = [], calculation = [];
      var i = tokens.length;
      while (i--) {
        var obj = tokens[i];
        if (!labels.hasOwnProperty(obj)) continue;
        words.push(obj);
        var tokenScore = labels[obj];
        tokenScore = languageProcessor.applyScoringStrategy(languageCode, tokens, i, tokenScore);
        if (tokenScore > 0) positive.push(obj);
        if (tokenScore < 0) negative.push(obj);
        score += tokenScore;
        var zipObj = {};
        zipObj[obj] = tokenScore;
        calculation.push(zipObj);
      }
      var result = {
        score,
        comparative: tokens.length > 0 ? score / tokens.length : 0,
        calculation,
        tokens,
        words,
        positive,
        negative
      };
      if (typeof callback === "function") {
        process.nextTick(function() {
          callback(null, result);
        });
      } else {
        return result;
      }
    };
    module.exports = Sentiment;
  }
});

// public/chatai.js
var require_chatai = __commonJS({
  "public/chatai.js"(exports, module) {
    var { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require_dist();
    var Sentiment = require_lib();
    var genAI = new GoogleGenerativeAI("AIzaSyB2JPYGICXfdp3uKJ3xve0Wp-zJh2cdulM");
    var safety_settings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ];
    var ChatAI = class {
      constructor(options) {
        let defaults = {
          api_key: "",
          source: "Google",
          model: "gemini-1.5-flash",
          conversations: [],
          selected_conversation: null,
          container: ".chat-ai",
          chat_speed: 30,
          title: "HappyPrism",
          max_tokens: 1e3,
          version: "1.0.0",
          show_tokens: true,
          available_models: ["gemini-1.5-flash"],
          safety_settings
        };
        this.agentNames = ["Spectrum", "Sol", "Amber", "Red", "Violet", "Jean", "Ivy"];
        this.options = Object.assign(defaults, options);
        this.options.container = document.querySelector(this.options.container);
        this.options.container.innerHTML = /*HTML*/
        `
            <main class="content">
                ${this._welcomePageTemplate()}
                <div class="response-buttons"></div>
                <form class="message-form">
                    <input type="text" placeholder="Send a message to Spectrum..." required>
                    <button type="submit"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </main>
        `;
        let settings = this.getSettings();
        if (settings) {
          this.options = Object.assign(this.options, settings);
        }
        this._eventHandlers();
        this.container.querySelector(".message-form input").focus();
      }
      createResponseButtons() {
        const responseContainer = this.container.querySelector(".response-buttons");
        responseContainer.innerHTML = "";
        const conversation = this.selectedConversation;
        const interaction = conversation.interactions[conversation.interactions.length - 1];
        const buttons = interaction.responseOptions;
        buttons.forEach((buttonText) => {
          const button = document.createElement("button");
          button.textContent = buttonText;
          button.onclick = () => this.handleResponseButtonClick(buttonText);
          responseContainer.appendChild(button);
        });
        responseContainer.scrollIntoView({ behavior: "smooth", block: "end" });
      }
      clearResponseButtons() {
        const responseContainer = this.container.querySelector(".response-buttons");
        responseContainer.innerHTML = "";
      }
      handleResponseButtonClick(response) {
        const input = this.container.querySelector(".message-form input");
        input.value = response;
        this.container.querySelector(".message-form").dispatchEvent(new Event("submit"));
      }
      // generateResponseOptions(botMessage) {
      //     // Logic to generate response options based on the bot's message content
      //     // This is a simple example, you can enhance it based on your specific needs
      //     if (botMessage.includes('')) {
      //         return ["Tell me more about goals", "How can I set a goal?", "Give me an example of a goal"];
      //     } else if (botMessage.includes('wellness')) {
      //         return ["What are the dimensions of wellness?", "How can I improve my wellness?", "Tell me more about wellness"];
      //     } else {
      //         return null;
      //     }
      // }
      async getMessage() {
        this.container.querySelector(".content .messages").scrollTop = this.container.querySelector(".content .messages").scrollHeight;
        const conversation = this.selectedConversation;
        const interaction = conversation.interactions[conversation.interactions.length - 1];
        let msg = "Hello.";
        if (interaction.messages.length > 0) {
          msg = interaction.messages[interaction.messages.length - 1].content;
        }
        this.clearResponseButtons();
        const history = [
          ...interaction.messages.map((message) => ({
            role: message.role,
            parts: [{ text: message.content }]
          }))
        ];
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-latest",
          apiVersion: "v1beta",
          systemInstruction: conversation.systemInstruction
        });
        const chat = model.startChat({
          history,
          generationConfig: {
            maxOutputTokens: this.maxTokens
          },
          safetySettings: this.safety_settings
        });
        let retryCount = 0;
        let success = false;
        while (retryCount < 3 && !success) {
          try {
            const result = await chat.sendMessageStream(msg);
            success = true;
            this.container.querySelector(".message.assistant.active .blink").remove();
            let msgElement = this.container.querySelector(".message.assistant.active .text");
            let text = "";
            let totalText = "";
            let responsesStarted = false;
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              totalText += chunkText;
              if (chunkText.includes("\xA7") && !responsesStarted) {
                const parts = chunkText.split("\xA7");
                msgElement.innerHTML += parts[0].replace(/(?:\r\n|\r|\n)/g, "<br>");
                text += parts[1];
                responsesStarted = true;
              }
              if (!responsesStarted) {
                msgElement.innerHTML += chunkText.replace(/(?:\r\n|\r|\n)/g, "<br>");
              }
            }
            if (totalText.includes("\xA7")) {
              let responseText = totalText.slice(totalText.indexOf("\xA7") + 1);
              const responseLines = responseText.split("\n");
              responseLines.shift();
              const responseOptions = [];
              const responseItemRegex = /^\d+-\s*(.*)$/;
              for (const responseLine of responseLines) {
                const responseMatch = responseLine.match(responseItemRegex);
                if (responseMatch) {
                  const newOption = responseMatch[1].trim();
                  const forbiddenSubstrings = ["(", ")", "...", "[", "]", "{", "}"];
                  if (!forbiddenSubstrings.some((substring) => newOption.includes(substring))) {
                    responseOptions.push(newOption);
                  }
                }
              }
              interaction.responseOptions = responseOptions;
            }
            this.container.querySelector(".message-form input").disabled = false;
            this.container.querySelector(".message-form input").placeholder = `Send a message to ${this.selectedConversation.name}...`;
            const assisstantMessage = this.container.querySelector(".message.assistant.active");
            if (assisstantMessage) {
              assisstantMessage.classList.remove("active");
            }
            interaction.messages.push({
              role: "model",
              content: totalText,
              date: /* @__PURE__ */ new Date(),
              total_tokens: 0,
              prompt_tokens: 0,
              completion_tokens: 0
            });
            this.createResponseButtons();
            this.container.querySelector(".content .messages").scrollTop = this.container.querySelector(".content .messages").scrollHeight;
            if (totalText.includes("onnecting you to " + this.agentNames[0]) || totalText.includes("onnecting you to " + this.agentNames[1]) || totalText.includes("onnecting you to " + this.agentNames[2]) || totalText.includes("onnecting you to " + this.agentNames[3]) || totalText.includes("onnecting you to " + this.agentNames[4]) || totalText.includes("onnecting you to " + this.agentNames[5]) || totalText.includes("onnecting you to " + this.agentNames[6])) {
              const triggerPhrase = "onnecting you to ";
              const startIndex = totalText.indexOf("onnecting you to ");
              if (startIndex !== -1) {
                const wordStartIndex = startIndex + triggerPhrase.length;
                const remainingMessage = totalText.substring(wordStartIndex).trim();
                const words = remainingMessage.split(" ");
                const agentName = words[0];
                console.log("openAgentChat triggered");
                setTimeout(async () => {
                  interaction.messages.push({
                    role: "system",
                    content: `openChat triggered, opening chat with ${agentName}`,
                    date: /* @__PURE__ */ new Date(),
                    total_tokens: 0,
                    prompt_tokens: 0,
                    completion_tokens: 0
                  });
                  this.selectedConversation.contextSummary = await this.getContextSummary(this.selectedConversation);
                  this.selectedConversation.systemInstruction = await this.getSystemInstruction(this.selectedConversation.name, "FollowUp", this.selectedConversation.contextSummary);
                  this.selectedConversation.interactions.push(await this.createNewInteraction());
                  let desiredConversation = this.selectedConversation;
                  if (desiredConversation = this.conversations.find((conversation2) => conversation2.name === agentName)) {
                    this.loadConversation(desiredConversation);
                  } else {
                    await this.createNewConversation(agentName);
                    this.loadConversation(this.conversations.find((conversation2) => conversation2.name === agentName));
                  }
                }, 1e3);
              }
            }
            if (totalText.includes("et's look at your goal: ")) {
              console.log("openGoalTracker triggered");
              const triggerPhrase = "et's look at your goal: ";
              const startIndex = totalText.indexOf("et's look at your goal: ");
              if (startIndex !== -1) {
                const goalNameStartIndex = startIndex + triggerPhrase.length;
                if (totalText[goalNameStartIndex] !== '"') {
                  console.log("No opening quotation mark found.");
                }
                let goalNameEndIndex = totalText.indexOf('"', goalNameStartIndex + 1);
                if (goalNameEndIndex === -1) {
                  return "No closing quotation mark found.";
                }
                console.log("Goal name: ", totalText.slice(goalNameStartIndex + 1, goalNameEndIndex));
              }
            }
          } catch (error) {
            this.container.querySelector(".content .messages").innerHTML = "";
            this.container.querySelector(".response-buttons").innerHTML = "";
            this.container.querySelector(".message-form input").disabled = false;
            this.container.querySelector(".message-form input").placeholder = `Send a message to ${this.selectedConversation.name}...`;
            this.showErrorMessage("There has been an error, please try sending a different message.");
          }
        }
      }
      async getJsonFile() {
        try {
          let [fileHandle] = await window.showOpenFilePicker();
          let file = await fileHandle.getFile();
          let fileContents = await file.text();
          let jsonObject = JSON.parse(fileContents);
          return { content: jsonObject, name: file.name };
        } catch (error) {
          if (error.code !== DOMException.ABORT_ERR) {
            console.error("Error reading JSON file:", error);
            this.showErrorMessage(error.message);
          }
        }
      }
      async saveJsonToFile(jsonObject) {
        try {
          let options = {
            suggestedName: "ai-conversations.json",
            types: [{
              description: "JSON Files",
              accept: { "application/json": [".json"] }
            }]
          };
          let handle = await window.showSaveFilePicker(options);
          let writable = await handle.createWritable();
          let jsonString = JSON.stringify(jsonObject, null, 2);
          await writable.write(jsonString);
          await writable.close();
          this.options.title = handle.name;
          this.updateTitle(false);
          this.showSuccessMessage("File saved successfully.");
        } catch (error) {
          if (error.code !== DOMException.ABORT_ERR) {
            console.error("Error saving JSON file:", error);
            this.showErrorMessage(error.message);
          }
        }
      }
      showErrorMessage(message) {
        this.container.querySelectorAll(".error").forEach((error2) => error2.remove());
        let error = document.createElement("div");
        error.classList.add("error-toast");
        error.innerHTML = message;
        this.container.appendChild(error);
        error.getBoundingClientRect();
        error.style.transition = "opacity .5s ease-in-out 4s";
        error.style.opacity = 0;
        setTimeout(() => error.remove(), 5e3);
      }
      showSuccessMessage(message) {
        this.container.querySelectorAll(".success").forEach((success2) => success2.remove());
        let success = document.createElement("div");
        success.classList.add("success-toast");
        success.innerHTML = message;
        this.container.appendChild(success);
        success.getBoundingClientRect();
        success.style.transition = "opacity .5s ease-in-out 4s";
        success.style.opacity = 0;
        setTimeout(() => success.remove(), 5e3);
      }
      formatElapsedTime(dateString) {
        let date = new Date(dateString);
        let now = /* @__PURE__ */ new Date();
        let elapsed = now - date;
        let seconds = Math.floor(elapsed / 1e3);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        if (days > 1) {
          return `${days} days ago`;
        } else if (days === 1) {
          return "Yesterday";
        } else if (hours > 0) {
          return `${hours} hours ago`;
        } else if (minutes > 0) {
          return `${minutes} minutes ago`;
        } else {
          return `${seconds} seconds ago`;
        }
      }
      loadConversation(conversation) {
        this.clearWelcomeScreen();
        this.clearMessages();
        this.clearResponseButtons();
        this.container.querySelector(".content .messages").insertAdjacentHTML("afterbegin", `
            <div class="conversation-title">
                <h2><span class="text">${conversation.name}</span><i class="fa-solid fa-pencil edit"></i><i class="fa-solid fa-trash delete"></i></h2>
            </div>
        `);
        this._conversationTitleClickHandler();
        this.createResponseButtons();
        this.container.querySelector(".message-form input").placeholder = `Send a message to ${conversation.name}...`;
        conversation.interactions.forEach((interaction) => {
          interaction.messages.forEach((message) => {
            if (message.role != "system") {
              let content = message.content.split("\xA7")[0];
              this.container.querySelector(".content .messages").insertAdjacentHTML(
                "afterbegin",
                /*HTML*/
                `
                    <div class="message ${message.role == "model" ? "assistant" : "user"}">
                        <div class="wrapper">
                            <div class="avatar">${message.role == "model" ? "AI" : '<i class="fa-solid fa-user"></i>'}</div>
                            <div class="details">
                                <div class="date" title="${message.date}">${this.formatElapsedTime(message.date)}</div>
                                <div class="text">
                                    ${content.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/```(.*?)```/, "<pre><code>$1</code></pre>")}
                                    ${this.options.show_tokens && message.total_tokens ? '<div><span class="tokens">' + message.total_tokens + " Tokens</span></div>" : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                `
              );
            }
          });
        });
      }
      clearWelcomeScreen() {
        if (this.container.querySelector(".content .welcome")) {
          this.container.querySelector(".content .welcome").remove();
          this.container.querySelector(".content").insertAdjacentHTML("afterbegin", '<div class="messages"></div>');
          return true;
        }
        return false;
      }
      clearMessages() {
        if (this.container.querySelector(".content .messages")) {
          this.container.querySelector(".content .messages").innerHTML = "";
          return true;
        }
        return false;
      }
      async createNewConversation(agentName = null) {
        agentName = agentName != null ? agentName : "Spectrum";
        let interactionsArray = [];
        let contextSummary = "";
        let promptName = "Initial";
        const conversation = this.conversations.find((previousConversation) => previousConversation.name === agentName);
        if (conversation) {
          contextSummary = await this.getContextSummary(conversation);
          promptName = "FollowUp";
        }
        let systemInstruction = await this.getSystemInstruction(agentName, promptName, contextSummary);
        interactionsArray.push(await this.createNewInteraction(agentName));
        let index = this.conversations.push({ name: agentName, interactions: interactionsArray, systemInstruction, contextSummary });
        console.log(this.conversations);
        this.clearWelcomeScreen();
        this.clearMessages();
        this._conversationClickHandlers();
        this.container.querySelector(".content .messages").innerHTML = '<div class="conversation-title"><h2><span class="text">' + agentName + '</span><i class="fa-solid fa-pencil edit"></i><i class="fa-solid fa-trash delete"></i></h2></div>';
        this._conversationTitleClickHandler();
        this.container.querySelector(".message-form input").focus();
        this.container.querySelector(".message-form input").placeholder = `Send a message to ${agentName}...`;
        this.updateTitle();
        return index - 1;
      }
      async getSystemInstruction(agentName, promptName, contextSummary) {
        let promptsPath = `./Prompts/${agentName}/`;
        const response = await fetch(promptsPath + promptName + ".txt");
        const text = await response.text();
        if (contextSummary.length > 0) {
          return text + "\n\n" + contextSummary;
        }
        return text;
      }
      async createNewInteraction(agentName = null) {
        agentName = agentName != null ? agentName : "Spectrum";
        let currentInteraction = null;
        let conversation = null;
        let promptName = "Initial";
        conversation = this.conversations.find((previousConversation) => previousConversation.name === agentName);
        if (conversation) {
          const currentInteractionIndex = conversation.interactions.length - 1;
          currentInteraction = conversation.interactions[currentInteractionIndex];
          promptName = "FollowUp";
        }
        const newInteraction = { messages: [], responseOptions: [] };
        console.log(`New ${promptName} interaction with ${agentName} created.`);
        return newInteraction;
      }
      async getContextSummary(conversation) {
        const getPrompt = await fetch(`./Prompts/Summarizer/prompt.txt`);
        const summarizerInstructions = await getPrompt.text();
        const summarizerModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-latest",
          apiVersion: "v1beta",
          systemInstruction: summarizerInstructions
        });
        let previousContext = `*PREVIOUS CONTEXT BETWEEN USER AND ${conversation.name}*

`;
        previousContext += conversation.contextSummary;
        const currentInteraction = conversation.interactions[conversation.interactions.length - 1];
        const messages = currentInteraction.messages;
        let transcript = `*TRANSCRIPT BETWEEN USER AND ${conversation.name}*

`;
        messages.forEach((message) => {
          const role = message.role === "user" ? "USER" : "ASSISTANT";
          transcript += `${role}: ${message.content}

`;
        });
        const history = [
          {
            role: "user",
            parts: [{ text: previousContext }]
          },
          {
            role: "user",
            parts: [{ text: transcript }]
          }
        ];
        const chat = summarizerModel.startChat({
          history,
          generationConfig: {
            maxOutputTokens: this.maxTokens
          },
          safetySettings: this.safety_settings
        });
        const msg = "Create a summary of this conversation so far.";
        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();
        console.log("Context Summary: ", text);
        return text;
      }
      updateTitle(unsaved = true) {
        document.title = unsaved ? "* " + this.options.title.replace("* ", "") : this.options.title.replace("* ", "");
      }
      modal(options) {
        let element;
        if (document.querySelector(options.element)) {
          element = document.querySelector(options.element);
        } else if (options.modalTemplate) {
          document.body.insertAdjacentHTML("beforeend", options.modalTemplate());
          element = document.body.lastElementChild;
        }
        options.element = element;
        options.open = (obj) => {
          element.style.display = "flex";
          element.getBoundingClientRect();
          element.classList.add("open");
          if (options.onOpen) options.onOpen(obj);
        };
        options.close = (obj) => {
          if (options.onClose) {
            let returnCloseValue = options.onClose(obj);
            if (returnCloseValue !== false) {
              element.style.display = "none";
              element.classList.remove("open");
              element.remove();
            }
          } else {
            element.style.display = "none";
            element.classList.remove("open");
            element.remove();
          }
        };
        if (options.state == "close") {
          options.close({ source: element, button: null });
        } else if (options.state == "open") {
          options.open({ source: element });
        }
        element.querySelectorAll(".modal-close").forEach((e) => {
          e.onclick = (event) => {
            event.preventDefault();
            options.close({ source: element, button: e });
          };
        });
        return options;
      }
      openSettingsModal() {
        let self = this;
        return this.modal({
          state: "open",
          modalTemplate: function() {
            return `
                <div class="chat-ai-modal">
                    <div class="content">
                        <h3 class="heading">Settings<span class="modal-close">&times;</span></h3>
                        <div class="body">
                            <form class="settings-form" action="">
                                <label for="api_key">API Key</label>
                                <input type="text" name="api_key" id="api_key" value="${self.APIKey}">
                                <label for="source">Source</label>
                                <select name="source" id="source">
                                    <option value="openai" selected>OpenAI</option>
                                </select>
                                <label for="model">Model</label>
                                <select name="model" id="model">
                                    ${self.options.available_models.map((m) => `<option value="${m}"${self.model == m ? " selected" : ""}>${m}</option>`).join("")}
                                </select>
                                <label for="max_tokens">Max Tokens</label>
                                <input type="number" name="max_tokens" id="max_tokens" value="${self.maxTokens}">
                                <div class="msg"></div>
                            </form>
                        </div>
                        <div class="footer">
                            <a href="#" class="btn modal-close save">Save</a>
                            <a href="#" class="btn modal-close reset right alt">Reset</a>
                        </div>
                    </div>
                </div>
                `;
          },
          onClose: function(event) {
            if (event && event.button) {
              if (event.button.classList.contains("save")) {
                self.APIKey = event.source.querySelector("#api_key").value;
                self.maxTokens = event.source.querySelector("#max_tokens").value;
                self.source = event.source.querySelector("#source").value;
                self.model = event.source.querySelector("#model").value;
                self.saveSettings();
              }
              if (event.button.classList.contains("reset")) {
                localStorage.removeItem("settings");
                location.reload();
              }
            }
          }
        });
      }
      getSettings() {
        return localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : false;
      }
      saveSettings() {
        localStorage.setItem("settings", JSON.stringify({ api_key: this.APIKey, max_tokens: this.maxTokens, source: this.source, model: this.model }));
      }
      _welcomePageTemplate() {
        return `
            <div class="welcome">
                <h1>HappyPrism Chat<span class="ver">beta</span></h1>                    
                <p>Type your first message below to get started!</p>
            </div>
        `;
      }
      _sidebarTemplate() {
        return `
            <a href="#" class="open-sidebar" title="Open Sidebar"><i class="fa-solid fa-bars"></i></a>
            <nav class="conversations">
                <a class="new-conversation" href="#"><i class="fa-solid fa-plus"></i>New Conversation</a>
                <div class="list"></div>
                <div class="footer">
                    <a class="save" href="#" title="Save"><i class="fa-solid fa-floppy-disk"></i></a>
                    <a class="open-database" href="#"><i class="fa-regular fa-folder-open"></i></a>
                    <a class="settings" href="#"><i class="fa-solid fa-cog"></i></a>
                    <a class="close-sidebar" href="#" title="Close Sidebar"><i class="fa-solid fa-bars"></i></a>
                </div>
            </nav>
        `;
      }
      _conversationClickHandlers() {
        this.container.querySelectorAll(".conversations .list a").forEach((conversation) => {
          conversation.onclick = (event) => {
            event.preventDefault();
            this.container.querySelectorAll(".conversations .list a").forEach((c) => c.classList.remove("selected"));
            conversation.classList.add("selected");
            this.selectedConversationIndex = conversation.dataset.id;
            this.selectedConversation = this.conversations[this.selectedConversationIndex];
            this.loadConversation(this.selectedConversation);
            this.container.querySelector(".content .messages").scrollTop = this.container.querySelector(".content .messages").scrollHeight;
          };
        });
      }
      _conversationTitleClickHandler() {
        this.container.querySelector(".conversation-title i.edit").onclick = () => {
          this.container.querySelector(".conversation-title .text").contentEditable = true;
          this.container.querySelector(".conversation-title .text").focus();
          let update = () => {
            this.container.querySelector(".conversation-title .text").contentEditable = false;
            this.selectedConversation.name = this.container.querySelector(".conversation-title .text").innerText;
            this.container.querySelector(".conversation-title .text").blur();
            this.container.querySelector('.conversations .list a[data-id="' + this.selectedConversationIndex + '"]').innerHTML = '<i class="fa-regular fa-message"></i>' + this.selectedConversation.name;
            this.container.querySelector('.conversations .list a[data-id="' + this.selectedConversationIndex + '"]').title = this.selectedConversation.name;
            this.updateTitle();
          };
          this.container.querySelector(".conversation-title .text").onblur = () => update();
          this.container.querySelector(".conversation-title .text").onkeydown = (event) => {
            if (event.keyCode == 13) {
              event.preventDefault();
              update();
            }
          };
        };
        this.container.querySelector(".conversation-title i.delete").onclick = () => {
          if (confirm("Are you sure you want to delete this conversation?")) {
            this.conversations.splice(this.selectedConversationIndex, 1);
            this.selectedConversation = [];
            this.selectedConversationIndex = null;
            this.container.querySelector(".content").innerHTML = "";
            this.container.querySelector(".conversations .list .conversation.selected").remove();
            this.updateTitle();
            if (!this.container.querySelector(".content .welcome")) {
              this.container.querySelector(".content").insertAdjacentHTML("afterbegin", this._welcomePageTemplate());
            }
            this._openDatabaseEventHandlers();
          }
        };
      }
      _openDatabaseEventHandlers() {
        this.container.querySelectorAll(".open-database").forEach((button) => {
          button.onclick = (event) => {
            event.preventDefault();
            if (document.title.startsWith("*") && !confirm("You have unsaved changes. Continue without saving?")) {
              return;
            }
            this.getJsonFile().then((json) => {
              if (json !== void 0) {
                if (this.container.querySelector(".content .messages")) {
                  this.container.querySelector(".content .messages").remove();
                }
                if (!this.container.querySelector(".content .welcome")) {
                  this.container.querySelector(".content").insertAdjacentHTML("afterbegin", this._welcomePageTemplate());
                }
                this.container.querySelector(".conversations .list").innerHTML = "";
                this.selectedConversation = [];
                this.selectedConversationIndex = null;
                this.conversations = json.content;
                document.title = json.name;
                this.options.title = json.name;
                this.conversations.forEach((conversation, index) => {
                  this.container.querySelector(".conversations .list").insertAdjacentHTML("beforeend", `<a class="conversation" href="#" data-id="${index}" title="${conversation.name}"><i class="fa-regular fa-message"></i>${conversation.name}</a>`);
                });
                this._conversationClickHandlers();
                this._openDatabaseEventHandlers();
              }
            });
          };
        });
      }
      async _eventHandlers() {
        this.container.querySelector(".message-form").onsubmit = async (event) => {
          event.preventDefault();
          this.clearWelcomeScreen();
          if (this.selectedConversation === void 0) {
            this.selectedConversationIndex = await this.createNewConversation();
            this.selectedConversation = this.conversations[this.selectedConversationIndex];
          }
          if (this.selectedConversation) {
            let date = /* @__PURE__ */ new Date();
            const conversation = this.selectedConversation;
            const interaction = conversation.interactions[conversation.interactions.length - 1];
            interaction.messages.push({
              role: "user",
              content: this.container.querySelector(".message-form input").value,
              date
            });
            this.container.querySelector(".messages").insertAdjacentHTML(
              "afterbegin",
              /*HTML*/
              `
                    <div class="message assistant active">
                        <div class="wrapper">
                            <div class="avatar">AI</div>
                            <div class="details">
                                <div class="date" data-date="${date}" title="${date}">just now</div>
                                <div class="text"><span class="blink">_</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="message user">
                        <div class="wrapper">
                            <div class="avatar"><i class="fa-solid fa-user"></i></div>
                            <div class="details">
                                <div class="date" data-date="${date}" title="${date}">just now</div>
                                <div class="text">${this.container.querySelector(".message-form input").value}</div>
                            </div>
                        </div>
                    </div>
                `
            );
            this.container.querySelector(".message-form input").disabled = true;
            this.getMessage(this.container.querySelector(".message-form input").value);
            this.container.querySelector(".message-form input").value = "";
            this.updateTitle();
            setInterval(() => {
              this.container.querySelectorAll("[data-date]").forEach((element) => {
                element.innerHTML = this.formatElapsedTime(element.getAttribute("data-date"));
              });
            }, 12e4);
            this._openDatabaseEventHandlers();
            this._conversationClickHandlers();
          }
        };
      }
      get APIKey() {
        return this.options.api_key;
      }
      set APIKey(value) {
        this.options.api_key = value;
      }
      get model() {
        return this.options.model;
      }
      set model(value) {
        this.options.model = value;
      }
      get source() {
        return this.options.source;
      }
      set source(value) {
        this.options.source = value;
      }
      get conversations() {
        return this.options.conversations;
      }
      set conversations(value) {
        this.options.conversations = value;
      }
      get selectedConversationIndex() {
        return this.options.selected_conversation;
      }
      set selectedConversationIndex(value) {
        this.options.selected_conversation = value;
      }
      get selectedConversation() {
        return this.conversations[this.selectedConversationIndex];
      }
      set selectedConversation(value) {
        this.conversations[this.selectedConversationIndex] = value;
      }
      get container() {
        return this.options.container;
      }
      set container(value) {
        this.options.container = value;
      }
      get maxTokens() {
        return parseInt(this.options.max_tokens);
      }
      set maxTokens(value) {
        this.options.max_tokens = parseInt(value);
      }
    };
    window.ChatAI = ChatAI;
    module.exports = ChatAI;
  }
});
export default require_chatai();
/*! Bundled license information:

@google/generative-ai/dist/index.js:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=chatai.js.map
