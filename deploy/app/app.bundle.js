(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a2, b2) => (typeof require !== "undefined" ? require : a2)[b2]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __glob = (map2) => (path2) => {
    var fn = map2[path2];
    if (fn) return fn();
    throw new Error("Module not found in bundle: " + path2);
  };
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win2) => {
        var _a, _b;
        if (win2 === null || win2 === void 0 ? void 0 : win2.androidBridge) {
          return "android";
        } else if ((_b = (_a = win2 === null || win2 === void 0 ? void 0 : win2.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win2) => {
        const capCustomPlatform = win2.CapacitorCustomPlatform || null;
        const cap = win2.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win2);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h3) => h3.name === pluginName);
        };
        const handleError = (err2) => win2.console.error(err2);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform2 = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform2 in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform2] === "function" ? jsImplementation = await jsImplementations[platform2]() : jsImplementation = jsImplementations[platform2];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m2) => prop === m2.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform2}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p2 = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p3 = fn(...args);
                  remove = p3 === null || p3 === void 0 ? void 0 : p3.remove;
                  return p3;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform2}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p2.remove = async () => remove();
              }
              return p2;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener2 = createPluginMethodWrapper("addListener");
          const removeListener2 = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener2({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener2({
                eventName,
                callbackId
              }, callback);
            };
            const p2 = new Promise((resolve2) => call.then(() => resolve2({ remove })));
            p2.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p2;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener2;
                case "removeListener":
                  return removeListener2;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform2] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win2) => win2.Capacitor = createCapacitor(win2);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p2 = Promise.resolve({ remove });
          return p2;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          this.listeners[eventName].splice(index, 1);
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path2 = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path2}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve2, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve2(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k2) => k2.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // node_modules/@capacitor-community/sqlite/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    CapacitorSQLiteWeb: () => CapacitorSQLiteWeb
  });
  var CapacitorSQLiteWeb;
  var init_web = __esm({
    "node_modules/@capacitor-community/sqlite/dist/esm/web.js"() {
      init_dist();
      CapacitorSQLiteWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.jeepSqliteElement = null;
          this.isWebStoreOpen = false;
        }
        async initWebStore() {
          await customElements.whenDefined("jeep-sqlite");
          this.jeepSqliteElement = document.querySelector("jeep-sqlite");
          this.ensureJeepSqliteIsAvailable();
          this.jeepSqliteElement.addEventListener("jeepSqliteImportProgress", (event) => {
            this.notifyListeners("sqliteImportProgressEvent", event.detail);
          });
          this.jeepSqliteElement.addEventListener("jeepSqliteExportProgress", (event) => {
            this.notifyListeners("sqliteExportProgressEvent", event.detail);
          });
          this.jeepSqliteElement.addEventListener("jeepSqliteHTTPRequestEnded", (event) => {
            this.notifyListeners("sqliteHTTPRequestEndedEvent", event.detail);
          });
          this.jeepSqliteElement.addEventListener("jeepSqlitePickDatabaseEnded", (event) => {
            this.notifyListeners("sqlitePickDatabaseEndedEvent", event.detail);
          });
          this.jeepSqliteElement.addEventListener("jeepSqliteSaveDatabaseToDisk", (event) => {
            this.notifyListeners("sqliteSaveDatabaseToDiskEvent", event.detail);
          });
          if (!this.isWebStoreOpen) {
            this.isWebStoreOpen = await this.jeepSqliteElement.isStoreOpen();
          }
          return;
        }
        async saveToStore(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.saveToStore(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getFromLocalDiskToStore(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.getFromLocalDiskToStore(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async saveToLocalDisk(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.saveToLocalDisk(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async echo(options) {
          this.ensureJeepSqliteIsAvailable();
          const echoResult = await this.jeepSqliteElement.echo(options);
          return echoResult;
        }
        async createConnection(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.createConnection(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async open(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.open(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async closeConnection(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.closeConnection(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getVersion(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const versionResult = await this.jeepSqliteElement.getVersion(options);
            return versionResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async checkConnectionsConsistency(options) {
          this.ensureJeepSqliteIsAvailable();
          try {
            const consistencyResult = await this.jeepSqliteElement.checkConnectionsConsistency(options);
            return consistencyResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async close(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.close(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async beginTransaction(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const changes = await this.jeepSqliteElement.beginTransaction(options);
            return changes;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async commitTransaction(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const changes = await this.jeepSqliteElement.commitTransaction(options);
            return changes;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async rollbackTransaction(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const changes = await this.jeepSqliteElement.rollbackTransaction(options);
            return changes;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isTransactionActive(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const result = await this.jeepSqliteElement.isTransactionActive(options);
            return result;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getTableList(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const tableListResult = await this.jeepSqliteElement.getTableList(options);
            return tableListResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async execute(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const executeResult = await this.jeepSqliteElement.execute(options);
            return executeResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async executeSet(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const executeResult = await this.jeepSqliteElement.executeSet(options);
            return executeResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async run(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const runResult = await this.jeepSqliteElement.run(options);
            return runResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async query(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const queryResult = await this.jeepSqliteElement.query(options);
            return queryResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isDBExists(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const dbExistsResult = await this.jeepSqliteElement.isDBExists(options);
            return dbExistsResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isDBOpen(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const isDBOpenResult = await this.jeepSqliteElement.isDBOpen(options);
            return isDBOpenResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isDatabase(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const isDatabaseResult = await this.jeepSqliteElement.isDatabase(options);
            return isDatabaseResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isTableExists(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const tableExistsResult = await this.jeepSqliteElement.isTableExists(options);
            return tableExistsResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async deleteDatabase(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.deleteDatabase(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async isJsonValid(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const isJsonValidResult = await this.jeepSqliteElement.isJsonValid(options);
            return isJsonValidResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async importFromJson(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const importFromJsonResult = await this.jeepSqliteElement.importFromJson(options);
            return importFromJsonResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async exportToJson(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const exportToJsonResult = await this.jeepSqliteElement.exportToJson(options);
            return exportToJsonResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async createSyncTable(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const createSyncTableResult = await this.jeepSqliteElement.createSyncTable(options);
            return createSyncTableResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async setSyncDate(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.setSyncDate(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getSyncDate(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const getSyncDateResult = await this.jeepSqliteElement.getSyncDate(options);
            return getSyncDateResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async deleteExportedRows(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.deleteExportedRows(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async addUpgradeStatement(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.addUpgradeStatement(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async copyFromAssets(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.copyFromAssets(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getFromHTTPRequest(options) {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            await this.jeepSqliteElement.getFromHTTPRequest(options);
            return;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        async getDatabaseList() {
          this.ensureJeepSqliteIsAvailable();
          this.ensureWebstoreIsOpen();
          try {
            const databaseListResult = await this.jeepSqliteElement.getDatabaseList();
            return databaseListResult;
          } catch (err2) {
            throw new Error(`${err2}`);
          }
        }
        /**
         * Checks if the `jeep-sqlite` element is present in the DOM.
         * If it's not in the DOM, this method throws an Error.
         *
         * Attention: This will always fail, if the `intWebStore()` method wasn't called before.
         */
        ensureJeepSqliteIsAvailable() {
          if (this.jeepSqliteElement === null) {
            throw new Error(`The jeep-sqlite element is not present in the DOM! Please check the @capacitor-community/sqlite documentation for instructions regarding the web platform.`);
          }
        }
        ensureWebstoreIsOpen() {
          if (!this.isWebStoreOpen) {
            throw new Error('WebStore is not open yet. You have to call "initWebStore()" first.');
          }
        }
        ////////////////////////////////////
        ////// UNIMPLEMENTED METHODS
        ////////////////////////////////////
        async getUrl() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getMigratableDbList(options) {
          console.log("getMigratableDbList", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async addSQLiteSuffix(options) {
          console.log("addSQLiteSuffix", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async deleteOldDatabases(options) {
          console.log("deleteOldDatabases", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async moveDatabasesAndAddSuffix(options) {
          console.log("moveDatabasesAndAddSuffix", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async isSecretStored() {
          throw this.unimplemented("Not implemented on web.");
        }
        async setEncryptionSecret(options) {
          console.log("setEncryptionSecret", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async changeEncryptionSecret(options) {
          console.log("changeEncryptionSecret", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async clearEncryptionSecret() {
          console.log("clearEncryptionSecret");
          throw this.unimplemented("Not implemented on web.");
        }
        async checkEncryptionSecret(options) {
          console.log("checkEncryptionPassPhrase", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async getNCDatabasePath(options) {
          console.log("getNCDatabasePath", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async createNCConnection(options) {
          console.log("createNCConnection", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async closeNCConnection(options) {
          console.log("closeNCConnection", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async isNCDatabase(options) {
          console.log("isNCDatabase", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async isDatabaseEncrypted(options) {
          console.log("isDatabaseEncrypted", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async isInConfigEncryption() {
          throw this.unimplemented("Not implemented on web.");
        }
        async isInConfigBiometricAuth() {
          throw this.unimplemented("Not implemented on web.");
        }
        async loadExtension(options) {
          console.log("loadExtension", options);
          throw this.unimplemented("Not implemented on web.");
        }
        async enableLoadExtension(options) {
          console.log("enableLoadExtension", options);
          throw this.unimplemented("Not implemented on web.");
        }
      };
    }
  });

  // node_modules/jeep-sqlite/dist/esm/jeep-sqlite.entry.js
  var jeep_sqlite_entry_exports = {};
  __export(jeep_sqlite_entry_exports, {
    jeep_sqlite: () => JeepSqlite
  });
  function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
  }
  function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
  }
  function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
      return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
      cachedSetTimeout = setTimeout;
      return setTimeout(fun, 0);
    }
    try {
      return cachedSetTimeout(fun, 0);
    } catch (e2) {
      try {
        return cachedSetTimeout.call(null, fun, 0);
      } catch (e3) {
        return cachedSetTimeout.call(this, fun, 0);
      }
    }
  }
  function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
      return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
      cachedClearTimeout = clearTimeout;
      return clearTimeout(marker);
    }
    try {
      return cachedClearTimeout(marker);
    } catch (e2) {
      try {
        return cachedClearTimeout.call(null, marker);
      } catch (e3) {
        return cachedClearTimeout.call(this, marker);
      }
    }
  }
  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
  }
  function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      runTimeout(drainQueue);
    }
  }
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  function noop() {
  }
  function binding(name) {
    throw new Error("process.binding is not supported");
  }
  function cwd() {
    return "/";
  }
  function chdir(dir) {
    throw new Error("process.chdir is not supported");
  }
  function umask() {
    return 0;
  }
  function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance$1) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  }
  function uptime() {
    var currentTime = /* @__PURE__ */ new Date();
    var dif = currentTime - startTime;
    return dif / 1e3;
  }
  function init() {
    inited = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
  }
  function toByteArray(b64) {
    if (!inited) {
      init();
    }
    var i, j, l2, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr(len * 3 / 4 - placeHolders);
    l2 = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for (i = 0, j = 0; i < l2; i += 4, j += 3) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = tmp >> 16 & 255;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr[L++] = tmp >> 8 & 255;
      arr[L++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[tmp << 4 & 63];
      output += "==";
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      output += lookup[tmp >> 10];
      output += lookup[tmp >> 4 & 63];
      output += lookup[tmp << 2 & 63];
      output += "=";
    }
    parts.push(output);
    return parts.join("");
  }
  function read(buffer, offset, isLE, mLen, nBytes) {
    var e2, m2;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d2 = isLE ? -1 : 1;
    var s2 = buffer[offset + i];
    i += d2;
    e2 = s2 & (1 << -nBits) - 1;
    s2 >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e2 = e2 * 256 + buffer[offset + i], i += d2, nBits -= 8) {
    }
    m2 = e2 & (1 << -nBits) - 1;
    e2 >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m2 = m2 * 256 + buffer[offset + i], i += d2, nBits -= 8) {
    }
    if (e2 === 0) {
      e2 = 1 - eBias;
    } else if (e2 === eMax) {
      return m2 ? NaN : (s2 ? -1 : 1) * Infinity;
    } else {
      m2 = m2 + Math.pow(2, mLen);
      e2 = e2 - eBias;
    }
    return (s2 ? -1 : 1) * m2 * Math.pow(2, e2 - mLen);
  }
  function write(buffer, value, offset, isLE, mLen, nBytes) {
    var e2, m2, c2;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d2 = isLE ? 1 : -1;
    var s2 = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m2 = isNaN(value) ? 1 : 0;
      e2 = eMax;
    } else {
      e2 = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c2 = Math.pow(2, -e2)) < 1) {
        e2--;
        c2 *= 2;
      }
      if (e2 + eBias >= 1) {
        value += rt / c2;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c2 >= 2) {
        e2++;
        c2 /= 2;
      }
      if (e2 + eBias >= eMax) {
        m2 = 0;
        e2 = eMax;
      } else if (e2 + eBias >= 1) {
        m2 = (value * c2 - 1) * Math.pow(2, mLen);
        e2 = e2 + eBias;
      } else {
        m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e2 = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m2 & 255, i += d2, m2 /= 256, mLen -= 8) {
    }
    e2 = e2 << mLen | m2;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e2 & 255, i += d2, e2 /= 256, eLen -= 8) {
    }
    buffer[offset + i - d2] |= s2 * 128;
  }
  function kMaxLength() {
    return Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
  }
  function createBuffer(that, length) {
    if (kMaxLength() < length) {
      throw new RangeError("Invalid typed array length");
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
      that = new Uint8Array(length);
      that.__proto__ = Buffer2.prototype;
    } else {
      if (that === null) {
        that = new Buffer2(length);
      }
      that.length = length;
    }
    return that;
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
      return new Buffer2(arg, encodingOrOffset, length);
    }
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new Error(
          "If encoding is specified then the first argument must be a string"
        );
      }
      return allocUnsafe(this, arg);
    }
    return from(this, arg, encodingOrOffset, length);
  }
  function from(that, value, encodingOrOffset, length) {
    if (typeof value === "number") {
      throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length);
    }
    if (typeof value === "string") {
      return fromString(that, value, encodingOrOffset);
    }
    return fromObject(that, value);
  }
  function assertSize(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative');
    }
  }
  function alloc(that, size, fill2, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size);
    }
    if (fill2 !== void 0) {
      return typeof encoding === "string" ? createBuffer(that, size).fill(fill2, encoding) : createBuffer(that, size).fill(fill2);
    }
    return createBuffer(that, size);
  }
  function allocUnsafe(that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer2.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString(that, string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);
    var actual = that.write(string, encoding);
    if (actual !== length) {
      that = that.slice(0, actual);
    }
    return that;
  }
  function fromArrayLike(that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer(that, array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length === void 0) {
      array = new Uint8Array(array);
    } else if (length === void 0) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
      that = array;
      that.__proto__ = Buffer2.prototype;
    } else {
      that = fromArrayLike(that, array);
    }
    return that;
  }
  function fromObject(that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);
      if (that.length === 0) {
        return that;
      }
      obj.copy(that, 0, 0, len);
      return that;
    }
    if (obj) {
      if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
        if (typeof obj.length !== "number" || isnan(obj.length)) {
          return createBuffer(that, 0);
        }
        return fromArrayLike(that, obj);
      }
      if (obj.type === "Buffer" && isArray(obj.data)) {
        return fromArrayLike(that, obj.data);
      }
    }
    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
  }
  function checked(length) {
    if (length >= kMaxLength()) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
    }
    return length | 0;
  }
  function internalIsBuffer(b2) {
    return !!(b2 != null && b2._isBuffer);
  }
  function byteLength(string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      string = "" + string;
    }
    var len = string.length;
    if (len === 0) return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len;
        case "utf8":
        case "utf-8":
        case void 0:
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len * 2;
        case "hex":
          return len >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  function slowToString(encoding, start, end) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding) encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  function swap(b2, n2, m2) {
    var i = b2[n2];
    b2[n2] = b2[m2];
    b2[m2] = i;
  }
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0) return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1;
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1;
    }
    if (typeof val === "string") {
      val = Buffer2.from(val, encoding);
    }
    if (internalIsBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (Buffer2.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read2(buf, i2) {
      if (indexSize === 1) {
        return buf[i2];
      } else {
        return buf.readUInt16BE(i2 * indexSize);
      }
    }
    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read2(arr, i + j) !== read2(val, j)) {
            found = false;
            break;
          }
        }
        if (found) return i;
      }
    }
    return -1;
  }
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed)) return i;
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf);
    } else {
      return fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    var ret = "";
    end = Math.min(buf.length, end);
    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    var out = "";
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = "";
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
    if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
  }
  function checkInt(buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
  }
  function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0) value = 65535 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0) value = 4294967295 + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
    }
  }
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
    if (offset < 0) throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, "");
    if (str.length < 2) return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function stringtrim(str) {
    if (str.trim) return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
  }
  function toHex(n2) {
    if (n2 < 16) return "0" + n2.toString(16);
    return n2.toString(16);
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1) bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0) break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0) break;
        bytes.push(
          codePoint >> 6 | 192,
          codePoint & 63 | 128
        );
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0) break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0) break;
        bytes.push(
          codePoint >> 18 | 240,
          codePoint >> 12 & 63 | 128,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    var c2, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break;
      c2 = str.charCodeAt(i);
      hi = c2 >> 8;
      lo = c2 % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length) break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  function isnan(val) {
    return val !== val;
  }
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
  }
  function isFastBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
  }
  function getAugmentedNamespace(n2) {
    if (n2.__esModule) return n2;
    var a2 = Object.defineProperty({}, "__esModule", { value: true });
    Object.keys(n2).forEach(function(k2) {
      var d2 = Object.getOwnPropertyDescriptor(n2, k2);
      Object.defineProperty(a2, k2, d2.get ? d2 : {
        enumerable: true,
        get: function() {
          return n2[k2];
        }
      });
    });
    return a2;
  }
  function commonjsRequire(path2) {
    throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
  }
  function normalizeArray(parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift("..");
      }
    }
    return parts;
  }
  function resolve() {
    var resolvedPath = "", resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path2 = i >= 0 ? arguments[i] : "/";
      if (typeof path2 !== "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path2) {
        continue;
      }
      resolvedPath = path2 + "/" + resolvedPath;
      resolvedAbsolute = path2.charAt(0) === "/";
    }
    resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function(p2) {
      return !!p2;
    }), !resolvedAbsolute).join("/");
    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  }
  function normalize(path2) {
    var isPathAbsolute = isAbsolute(path2), trailingSlash = substr(path2, -1) === "/";
    path2 = normalizeArray(filter(path2.split("/"), function(p2) {
      return !!p2;
    }), !isPathAbsolute).join("/");
    if (!path2 && !isPathAbsolute) {
      path2 = ".";
    }
    if (path2 && trailingSlash) {
      path2 += "/";
    }
    return (isPathAbsolute ? "/" : "") + path2;
  }
  function isAbsolute(path2) {
    return path2.charAt(0) === "/";
  }
  function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(filter(paths, function(p2, index) {
      if (typeof p2 !== "string") {
        throw new TypeError("Arguments to path.join must be strings");
      }
      return p2;
    }).join("/"));
  }
  function relative(from2, to) {
    from2 = resolve(from2).substr(1);
    to = resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from2.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  }
  function dirname(path2) {
    var result = splitPath(path2), root = result[0], dir = result[1];
    if (!root && !dir) {
      return ".";
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  }
  function basename(path2, ext) {
    var f2 = splitPath(path2)[2];
    if (ext && f2.substr(-1 * ext.length) === ext) {
      f2 = f2.substr(0, f2.length - ext.length);
    }
    return f2;
  }
  function extname(path2) {
    return splitPath(path2)[3];
  }
  function filter(xs, f2) {
    if (xs.filter) return xs.filter(f2);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      if (f2(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
  }
  async function n(...e2) {
    return (await t).default(...e2);
  }
  async function o(...e2) {
    return (await a).default(...e2);
  }
  function u(e2) {
    function t2(e3) {
      if (Object(e3) !== e3) return Promise.reject(new TypeError(e3 + " is not an object."));
      var t3 = e3.done;
      return Promise.resolve(e3.value).then(function(e4) {
        return { value: e4, done: t3 };
      });
    }
    return u = function(e3) {
      this.s = e3, this.n = e3.next;
    }, u.prototype = { s: null, n: null, next: function() {
      return t2(this.n.apply(this.s, arguments));
    }, return: function(e3) {
      var n2 = this.s.return;
      return void 0 === n2 ? Promise.resolve({ value: e3, done: true }) : t2(n2.apply(this.s, arguments));
    }, throw: function(e3) {
      var n2 = this.s.return;
      return void 0 === n2 ? Promise.reject(e3) : t2(n2.apply(this.s, arguments));
    } }, new u(e2);
  }
  var global$1, cachedSetTimeout, cachedClearTimeout, queue, draining, currentQueue, queueIndex, title, platform, browser, env, argv, version, versions, release, config, on, addListener, once, off, removeListener, removeAllListeners, emit, performance$1, performanceNow, startTime, browser$1, process, __dirname, lookup, revLookup, Arr, inited, toString, isArray, INSPECT_MAX_BYTES, MAX_ARGUMENTS_LENGTH, INVALID_BASE64_RE, commonjsGlobal, sqlWasm, empty, empty$1, require$$0, splitPathRe, splitPath, sep, delimiter, path, substr, path$1, require$$1, initSqlJs, UtilsStore, UtilsDrop, UtilsJSON, UtilsSQLStatement, UtilsDeleteError, UtilsDelete, UtilsSQLite, UtilsImportJSON, UtilsExportJSON, UtilsUpgrade, Database, localforage, localForage, jszip_min, e, t, a, s, c, l, p, d, y, f, m, w, v, h, b, P, k, jeepSqliteCss, JeepSqliteStyle0, JeepSqlite;
  var init_jeep_sqlite_entry = __esm({
    "node_modules/jeep-sqlite/dist/esm/jeep-sqlite.entry.js"() {
      init_index_68ac790b();
      global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
      cachedSetTimeout = defaultSetTimout;
      cachedClearTimeout = defaultClearTimeout;
      if (typeof global$1.setTimeout === "function") {
        cachedSetTimeout = setTimeout;
      }
      if (typeof global$1.clearTimeout === "function") {
        cachedClearTimeout = clearTimeout;
      }
      queue = [];
      draining = false;
      queueIndex = -1;
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      title = "browser";
      platform = "browser";
      browser = true;
      env = {};
      argv = [];
      version = "";
      versions = {};
      release = {};
      config = {};
      on = noop;
      addListener = noop;
      once = noop;
      off = noop;
      removeListener = noop;
      removeAllListeners = noop;
      emit = noop;
      performance$1 = global$1.performance || {};
      performanceNow = performance$1.now || performance$1.mozNow || performance$1.msNow || performance$1.oNow || performance$1.webkitNow || function() {
        return (/* @__PURE__ */ new Date()).getTime();
      };
      startTime = /* @__PURE__ */ new Date();
      browser$1 = {
        nextTick,
        title,
        browser,
        env,
        argv,
        version,
        versions,
        on,
        addListener,
        once,
        off,
        removeListener,
        removeAllListeners,
        emit,
        binding,
        cwd,
        chdir,
        umask,
        hrtime,
        platform,
        release,
        config,
        uptime
      };
      process = browser$1;
      __dirname = "/Volumes/Development_Lacie/Development/latest/jeep-sqlite/node_modules/sql.js/dist";
      lookup = [];
      revLookup = [];
      Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      inited = false;
      toString = {}.toString;
      isArray = Array.isArray || function(arr) {
        return toString.call(arr) == "[object Array]";
      };
      INSPECT_MAX_BYTES = 50;
      Buffer2.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== void 0 ? global$1.TYPED_ARRAY_SUPPORT : true;
      Buffer2.poolSize = 8192;
      Buffer2._augment = function(arr) {
        arr.__proto__ = Buffer2.prototype;
        return arr;
      };
      Buffer2.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        Buffer2.prototype.__proto__ = Uint8Array.prototype;
        Buffer2.__proto__ = Uint8Array;
      }
      Buffer2.alloc = function(size, fill2, encoding) {
        return alloc(null, size, fill2, encoding);
      };
      Buffer2.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer2.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer2.isBuffer = isBuffer;
      Buffer2.compare = function compare(a2, b2) {
        if (!internalIsBuffer(a2) || !internalIsBuffer(b2)) {
          throw new TypeError("Arguments must be Buffers");
        }
        if (a2 === b2) return 0;
        var x = a2.length;
        var y2 = b2.length;
        for (var i = 0, len = Math.min(x, y2); i < len; ++i) {
          if (a2[i] !== b2[i]) {
            x = a2[i];
            y2 = b2[i];
            break;
          }
        }
        if (x < y2) return -1;
        if (y2 < x) return 1;
        return 0;
      };
      Buffer2.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer2.concat = function concat(list, length) {
        if (!isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer2.alloc(0);
        }
        var i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        var buffer = Buffer2.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!internalIsBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      Buffer2.byteLength = byteLength;
      Buffer2.prototype._isBuffer = true;
      Buffer2.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer2.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer2.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer2.prototype.toString = function toString2() {
        var length = this.length | 0;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer2.prototype.equals = function equals(b2) {
        if (!internalIsBuffer(b2)) throw new TypeError("Argument must be a Buffer");
        if (this === b2) return true;
        return Buffer2.compare(this, b2) === 0;
      };
      Buffer2.prototype.inspect = function inspect() {
        var str = "";
        var max = INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          if (this.length > max) str += " ... ";
        }
        return "<Buffer " + str + ">";
      };
      Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
        if (!internalIsBuffer(target)) {
          throw new TypeError("Argument must be a Buffer");
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y2 = end - start;
        var len = Math.min(x, y2);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y2 = targetCopy[i];
            break;
          }
        }
        if (x < y2) return -1;
        if (y2 < x) return 1;
        return 0;
      };
      Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      Buffer2.prototype.write = function write2(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset | 0;
          if (isFinite(length)) {
            length = length | 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        var remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        var loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
              return asciiWrite(this, string, offset, length);
            case "latin1":
            case "binary":
              return latin1Write(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer2.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      MAX_ARGUMENTS_LENGTH = 4096;
      Buffer2.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        var newBuf;
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer2.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer2(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) {
            newBuf[i] = this[i + start];
          }
        }
        return newBuf;
      };
      Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        var val = this[offset + --byteLength2];
        var mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var i = byteLength2;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return read(this, offset, true, 23, 4);
      };
      Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length);
        return read(this, offset, false, 23, 4);
      };
      Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return read(this, offset, true, 52, 8);
      };
      Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length);
        return read(this, offset, false, 52, 8);
      };
      Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset | 0;
        byteLength2 = byteLength2 | 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        if (!Buffer2.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (!Buffer2.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
        } else {
          objectWriteUInt16(this, value, offset, true);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = value & 255;
        } else {
          objectWriteUInt16(this, value, offset, false);
        }
        return offset + 2;
      };
      Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value & 255;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else {
          objectWriteUInt32(this, value, offset, true);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset | 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        if (Buffer2.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = value & 255;
        } else {
          objectWriteUInt32(this, value, offset, false);
        }
        return offset + 4;
      };
      Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) {
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else if (len < 1e3 || !Buffer2.TYPED_ARRAY_SUPPORT) {
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, start + len),
            targetStart
          );
        }
        return len;
      };
      Buffer2.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code;
            }
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
        } else if (typeof val === "number") {
          val = val & 255;
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer2(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
      sqlWasm = { exports: {} };
      empty = {};
      empty$1 = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        "default": empty
      });
      require$$0 = /* @__PURE__ */ getAugmentedNamespace(empty$1);
      splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      splitPath = function(filename) {
        return splitPathRe.exec(filename).slice(1);
      };
      sep = "/";
      delimiter = ":";
      path = {
        extname,
        basename,
        dirname,
        sep,
        delimiter,
        relative,
        join,
        isAbsolute,
        normalize,
        resolve
      };
      substr = "ab".substr(-1) === "b" ? function(str, start, len) {
        return str.substr(start, len);
      } : function(str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
      };
      path$1 = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        resolve,
        normalize,
        isAbsolute,
        join,
        relative,
        sep,
        delimiter,
        dirname,
        basename,
        extname,
        "default": path
      });
      require$$1 = /* @__PURE__ */ getAugmentedNamespace(path$1);
      (function(module, exports) {
        var initSqlJsPromise = void 0;
        var initSqlJs2 = function(moduleConfig) {
          if (initSqlJsPromise) {
            return initSqlJsPromise;
          }
          initSqlJsPromise = new Promise(function(resolveModule, reject) {
            var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
            var originalOnAbortFunction = Module["onAbort"];
            Module["onAbort"] = function(errorThatCausedAbort) {
              reject(new Error(errorThatCausedAbort));
              if (originalOnAbortFunction) {
                originalOnAbortFunction(errorThatCausedAbort);
              }
            };
            Module["postRun"] = Module["postRun"] || [];
            Module["postRun"].push(function() {
              resolveModule(Module);
            });
            module = void 0;
            var f2;
            f2 || (f2 = typeof Module != "undefined" ? Module : {});
            var aa = "object" == typeof window, ba = "function" == typeof importScripts, ca = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node;
            f2.onRuntimeInitialized = function() {
              function a2(g, l2) {
                switch (typeof l2) {
                  case "boolean":
                    fc(g, l2 ? 1 : 0);
                    break;
                  case "number":
                    gc(g, l2);
                    break;
                  case "string":
                    hc(g, l2, -1, -1);
                    break;
                  case "object":
                    if (null === l2) ib(g);
                    else if (null != l2.length) {
                      var n2 = da(l2, ea);
                      ic(g, n2, l2.length, -1);
                      fa(n2);
                    } else xa(g, "Wrong API use : tried to return a value of an unknown type (" + l2 + ").", -1);
                    break;
                  default:
                    ib(g);
                }
              }
              function b2(g, l2) {
                for (var n2 = [], t2 = 0; t2 < g; t2 += 1) {
                  var w2 = m2(l2 + 4 * t2, "i32"), A = jc(w2);
                  if (1 === A || 2 === A) w2 = kc(w2);
                  else if (3 === A) w2 = lc(w2);
                  else if (4 === A) {
                    A = w2;
                    w2 = mc(A);
                    A = nc(A);
                    for (var N = new Uint8Array(w2), M = 0; M < w2; M += 1) N[M] = p2[A + M];
                    w2 = N;
                  } else w2 = null;
                  n2.push(w2);
                }
                return n2;
              }
              function c2(g, l2) {
                this.Ka = g;
                this.db = l2;
                this.Ia = 1;
                this.eb = [];
              }
              function d2(g, l2) {
                this.db = l2;
                l2 = ha(g) + 1;
                this.Xa = ia(l2);
                if (null === this.Xa) throw Error("Unable to allocate memory for the SQL string");
                q(g, u2, this.Xa, l2);
                this.cb = this.Xa;
                this.Ta = this.hb = null;
              }
              function e2(g) {
                this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
                if (null != g) {
                  var l2 = this.filename, n2 = "/", t2 = l2;
                  n2 && (n2 = "string" == typeof n2 ? n2 : ja(n2), t2 = l2 ? x(n2 + "/" + l2) : n2);
                  l2 = ka(true, true);
                  t2 = la(t2, (void 0 !== l2 ? l2 : 438) & 4095 | 32768, 0);
                  if (g) {
                    if ("string" == typeof g) {
                      n2 = Array(g.length);
                      for (var w2 = 0, A = g.length; w2 < A; ++w2) n2[w2] = g.charCodeAt(w2);
                      g = n2;
                    }
                    ma(t2, l2 | 146);
                    n2 = na(t2, 577);
                    oa(n2, g, 0, g.length, 0);
                    pa(n2);
                    ma(t2, l2);
                  }
                }
                this.handleError(r(this.filename, h3));
                this.db = m2(h3, "i32");
                lb(this.db);
                this.Ya = {};
                this.Ma = {};
              }
              var h3 = y2(4), k2 = f2.cwrap, r = k2("sqlite3_open", "number", ["string", "number"]), z = k2("sqlite3_close_v2", "number", ["number"]), v3 = k2("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), E = k2(
                "sqlite3_changes",
                "number",
                ["number"]
              ), H = k2("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), mb = k2("sqlite3_sql", "string", ["number"]), oc = k2("sqlite3_normalized_sql", "string", ["number"]), nb = k2("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), pc = k2("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), ob = k2("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), qc = k2("sqlite3_bind_double", "number", ["number", "number", "number"]), rc = k2("sqlite3_bind_int", "number", ["number", "number", "number"]), sc = k2("sqlite3_bind_parameter_index", "number", ["number", "string"]), tc = k2("sqlite3_step", "number", ["number"]), uc = k2("sqlite3_errmsg", "string", ["number"]), vc = k2("sqlite3_column_count", "number", ["number"]), wc = k2("sqlite3_data_count", "number", ["number"]), xc = k2("sqlite3_column_double", "number", ["number", "number"]), pb = k2("sqlite3_column_text", "string", ["number", "number"]), yc = k2("sqlite3_column_blob", "number", ["number", "number"]), zc = k2(
                "sqlite3_column_bytes",
                "number",
                ["number", "number"]
              ), Ac = k2("sqlite3_column_type", "number", ["number", "number"]), Bc = k2("sqlite3_column_name", "string", ["number", "number"]), Cc = k2("sqlite3_reset", "number", ["number"]), Dc = k2("sqlite3_clear_bindings", "number", ["number"]), Ec = k2("sqlite3_finalize", "number", ["number"]), qb = k2("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), jc = k2("sqlite3_value_type", "number", ["number"]), mc = k2("sqlite3_value_bytes", "number", ["number"]), lc = k2(
                "sqlite3_value_text",
                "string",
                ["number"]
              ), nc = k2("sqlite3_value_blob", "number", ["number"]), kc = k2("sqlite3_value_double", "number", ["number"]), gc = k2("sqlite3_result_double", "", ["number", "number"]), ib = k2("sqlite3_result_null", "", ["number"]), hc = k2("sqlite3_result_text", "", ["number", "string", "number", "number"]), ic = k2("sqlite3_result_blob", "", ["number", "number", "number", "number"]), fc = k2("sqlite3_result_int", "", ["number", "number"]), xa = k2("sqlite3_result_error", "", ["number", "string", "number"]), rb = k2(
                "sqlite3_aggregate_context",
                "number",
                ["number", "number"]
              ), lb = k2("RegisterExtensionFunctions", "number", ["number"]);
              c2.prototype.bind = function(g) {
                if (!this.Ka) throw "Statement closed";
                this.reset();
                return Array.isArray(g) ? this.vb(g) : null != g && "object" === typeof g ? this.wb(g) : true;
              };
              c2.prototype.step = function() {
                if (!this.Ka) throw "Statement closed";
                this.Ia = 1;
                var g = tc(this.Ka);
                switch (g) {
                  case 100:
                    return true;
                  case 101:
                    return false;
                  default:
                    throw this.db.handleError(g);
                }
              };
              c2.prototype.qb = function(g) {
                null == g && (g = this.Ia, this.Ia += 1);
                return xc(this.Ka, g);
              };
              c2.prototype.zb = function(g) {
                null == g && (g = this.Ia, this.Ia += 1);
                g = pb(this.Ka, g);
                if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
                return BigInt(g);
              };
              c2.prototype.Ab = function(g) {
                null == g && (g = this.Ia, this.Ia += 1);
                return pb(this.Ka, g);
              };
              c2.prototype.getBlob = function(g) {
                null == g && (g = this.Ia, this.Ia += 1);
                var l2 = zc(this.Ka, g);
                g = yc(this.Ka, g);
                for (var n2 = new Uint8Array(l2), t2 = 0; t2 < l2; t2 += 1) n2[t2] = p2[g + t2];
                return n2;
              };
              c2.prototype.get = function(g, l2) {
                l2 = l2 || {};
                null != g && this.bind(g) && this.step();
                g = [];
                for (var n2 = wc(this.Ka), t2 = 0; t2 < n2; t2 += 1) switch (Ac(this.Ka, t2)) {
                  case 1:
                    var w2 = l2.useBigInt ? this.zb(t2) : this.qb(t2);
                    g.push(w2);
                    break;
                  case 2:
                    g.push(this.qb(t2));
                    break;
                  case 3:
                    g.push(this.Ab(t2));
                    break;
                  case 4:
                    g.push(this.getBlob(t2));
                    break;
                  default:
                    g.push(null);
                }
                return g;
              };
              c2.prototype.getColumnNames = function() {
                for (var g = [], l2 = vc(this.Ka), n2 = 0; n2 < l2; n2 += 1) g.push(Bc(this.Ka, n2));
                return g;
              };
              c2.prototype.getAsObject = function(g, l2) {
                g = this.get(g, l2);
                l2 = this.getColumnNames();
                for (var n2 = {}, t2 = 0; t2 < l2.length; t2 += 1) n2[l2[t2]] = g[t2];
                return n2;
              };
              c2.prototype.getSQL = function() {
                return mb(this.Ka);
              };
              c2.prototype.getNormalizedSQL = function() {
                return oc(this.Ka);
              };
              c2.prototype.run = function(g) {
                null != g && this.bind(g);
                this.step();
                return this.reset();
              };
              c2.prototype.mb = function(g, l2) {
                null == l2 && (l2 = this.Ia, this.Ia += 1);
                g = qa(g);
                var n2 = da(g, ea);
                this.eb.push(n2);
                this.db.handleError(pc(this.Ka, l2, n2, g.length - 1, 0));
              };
              c2.prototype.ub = function(g, l2) {
                null == l2 && (l2 = this.Ia, this.Ia += 1);
                var n2 = da(g, ea);
                this.eb.push(n2);
                this.db.handleError(ob(this.Ka, l2, n2, g.length, 0));
              };
              c2.prototype.lb = function(g, l2) {
                null == l2 && (l2 = this.Ia, this.Ia += 1);
                this.db.handleError((g === (g | 0) ? rc : qc)(this.Ka, l2, g));
              };
              c2.prototype.xb = function(g) {
                null == g && (g = this.Ia, this.Ia += 1);
                ob(this.Ka, g, 0, 0, 0);
              };
              c2.prototype.nb = function(g, l2) {
                null == l2 && (l2 = this.Ia, this.Ia += 1);
                switch (typeof g) {
                  case "string":
                    this.mb(g, l2);
                    return;
                  case "number":
                    this.lb(g, l2);
                    return;
                  case "bigint":
                    this.mb(g.toString(), l2);
                    return;
                  case "boolean":
                    this.lb(g + 0, l2);
                    return;
                  case "object":
                    if (null === g) {
                      this.xb(l2);
                      return;
                    }
                    if (null != g.length) {
                      this.ub(g, l2);
                      return;
                    }
                }
                throw "Wrong API use : tried to bind a value of an unknown type (" + g + ").";
              };
              c2.prototype.wb = function(g) {
                var l2 = this;
                Object.keys(g).forEach(function(n2) {
                  var t2 = sc(l2.Ka, n2);
                  0 !== t2 && l2.nb(g[n2], t2);
                });
                return true;
              };
              c2.prototype.vb = function(g) {
                for (var l2 = 0; l2 < g.length; l2 += 1) this.nb(g[l2], l2 + 1);
                return true;
              };
              c2.prototype.reset = function() {
                this.freemem();
                return 0 === Dc(this.Ka) && 0 === Cc(this.Ka);
              };
              c2.prototype.freemem = function() {
                for (var g; void 0 !== (g = this.eb.pop()); ) fa(g);
              };
              c2.prototype.free = function() {
                this.freemem();
                var g = 0 === Ec(this.Ka);
                delete this.db.Ya[this.Ka];
                this.Ka = 0;
                return g;
              };
              d2.prototype.next = function() {
                if (null === this.Xa) return { done: true };
                null !== this.Ta && (this.Ta.free(), this.Ta = null);
                if (!this.db.db) throw this.fb(), Error("Database closed");
                var g = ra(), l2 = y2(4);
                sa(h3);
                sa(l2);
                try {
                  this.db.handleError(nb(this.db.db, this.cb, -1, h3, l2));
                  this.cb = m2(l2, "i32");
                  var n2 = m2(h3, "i32");
                  if (0 === n2) return this.fb(), { done: true };
                  this.Ta = new c2(n2, this.db);
                  this.db.Ya[n2] = this.Ta;
                  return { value: this.Ta, done: false };
                } catch (t2) {
                  throw this.hb = ta(this.cb), this.fb(), t2;
                } finally {
                  ua(g);
                }
              };
              d2.prototype.fb = function() {
                fa(this.Xa);
                this.Xa = null;
              };
              d2.prototype.getRemainingSQL = function() {
                return null !== this.hb ? this.hb : ta(this.cb);
              };
              "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d2.prototype[Symbol.iterator] = function() {
                return this;
              });
              e2.prototype.run = function(g, l2) {
                if (!this.db) throw "Database closed";
                if (l2) {
                  g = this.prepare(g, l2);
                  try {
                    g.step();
                  } finally {
                    g.free();
                  }
                } else this.handleError(v3(this.db, g, 0, 0, h3));
                return this;
              };
              e2.prototype.exec = function(g, l2, n2) {
                if (!this.db) throw "Database closed";
                var t2 = ra(), w2 = null;
                try {
                  var A = va(g), N = y2(4);
                  for (g = []; 0 !== m2(A, "i8"); ) {
                    sa(h3);
                    sa(N);
                    this.handleError(nb(
                      this.db,
                      A,
                      -1,
                      h3,
                      N
                    ));
                    var M = m2(h3, "i32");
                    A = m2(N, "i32");
                    if (0 !== M) {
                      var K = null;
                      w2 = new c2(M, this);
                      for (null != l2 && w2.bind(l2); w2.step(); ) null === K && (K = { columns: w2.getColumnNames(), values: [] }, g.push(K)), K.values.push(w2.get(null, n2));
                      w2.free();
                    }
                  }
                  return g;
                } catch (O) {
                  throw w2 && w2.free(), O;
                } finally {
                  ua(t2);
                }
              };
              e2.prototype.each = function(g, l2, n2, t2, w2) {
                "function" === typeof l2 && (t2 = n2, n2 = l2, l2 = void 0);
                g = this.prepare(g, l2);
                try {
                  for (; g.step(); ) n2(g.getAsObject(null, w2));
                } finally {
                  g.free();
                }
                if ("function" === typeof t2) return t2();
              };
              e2.prototype.prepare = function(g, l2) {
                sa(h3);
                this.handleError(H(this.db, g, -1, h3, 0));
                g = m2(h3, "i32");
                if (0 === g) throw "Nothing to prepare";
                var n2 = new c2(g, this);
                null != l2 && n2.bind(l2);
                return this.Ya[g] = n2;
              };
              e2.prototype.iterateStatements = function(g) {
                return new d2(g, this);
              };
              e2.prototype["export"] = function() {
                Object.values(this.Ya).forEach(function(l2) {
                  l2.free();
                });
                Object.values(this.Ma).forEach(wa);
                this.Ma = {};
                this.handleError(z(this.db));
                var g = ya(this.filename);
                this.handleError(r(this.filename, h3));
                this.db = m2(h3, "i32");
                lb(this.db);
                return g;
              };
              e2.prototype.close = function() {
                null !== this.db && (Object.values(this.Ya).forEach(function(g) {
                  g.free();
                }), Object.values(this.Ma).forEach(wa), this.Ma = {}, this.handleError(z(this.db)), za("/" + this.filename), this.db = null);
              };
              e2.prototype.handleError = function(g) {
                if (0 === g) return null;
                g = uc(this.db);
                throw Error(g);
              };
              e2.prototype.getRowsModified = function() {
                return E(this.db);
              };
              e2.prototype.create_function = function(g, l2) {
                Object.prototype.hasOwnProperty.call(this.Ma, g) && (wa(this.Ma[g]), delete this.Ma[g]);
                var n2 = Aa(function(t2, w2, A) {
                  w2 = b2(w2, A);
                  try {
                    var N = l2.apply(
                      null,
                      w2
                    );
                  } catch (M) {
                    xa(t2, M, -1);
                    return;
                  }
                  a2(t2, N);
                }, "viii");
                this.Ma[g] = n2;
                this.handleError(qb(this.db, g, l2.length, 1, 0, n2, 0, 0, 0));
                return this;
              };
              e2.prototype.create_aggregate = function(g, l2) {
                var n2 = l2.init || function() {
                  return null;
                }, t2 = l2.finalize || function(K) {
                  return K;
                }, w2 = l2.step;
                if (!w2) throw "An aggregate function must have a step function in " + g;
                var A = {};
                Object.hasOwnProperty.call(this.Ma, g) && (wa(this.Ma[g]), delete this.Ma[g]);
                l2 = g + "__finalize";
                Object.hasOwnProperty.call(this.Ma, l2) && (wa(this.Ma[l2]), delete this.Ma[l2]);
                var N = Aa(function(K, O, Ra) {
                  var Y = rb(K, 1);
                  Object.hasOwnProperty.call(A, Y) || (A[Y] = n2());
                  O = b2(O, Ra);
                  O = [A[Y]].concat(O);
                  try {
                    A[Y] = w2.apply(null, O);
                  } catch (Gc) {
                    delete A[Y], xa(K, Gc, -1);
                  }
                }, "viii"), M = Aa(function(K) {
                  var O = rb(K, 1);
                  try {
                    var Ra = t2(A[O]);
                  } catch (Y) {
                    delete A[O];
                    xa(K, Y, -1);
                    return;
                  }
                  a2(K, Ra);
                  delete A[O];
                }, "vi");
                this.Ma[g] = N;
                this.Ma[l2] = M;
                this.handleError(qb(this.db, g, w2.length - 1, 1, 0, 0, N, M, 0));
                return this;
              };
              f2.Database = e2;
            };
            var Ba = Object.assign({}, f2), Ca = "./this.program", B = "", Da, Ea;
            if (ca) {
              var fs = require$$0, Fa = require$$1;
              B = __dirname + "/";
              Ea = (a2) => {
                a2 = Ga(a2) ? new URL(a2) : Fa.normalize(a2);
                return fs.readFileSync(a2);
              };
              Da = (a2) => {
                a2 = Ga(a2) ? new URL(a2) : Fa.normalize(a2);
                return new Promise((b2, c2) => {
                  fs.readFile(a2, void 0, (d2, e2) => {
                    d2 ? c2(d2) : b2(e2.buffer);
                  });
                });
              };
              !f2.thisProgram && 1 < process.argv.length && (Ca = process.argv[1].replace(/\\/g, "/"));
              process.argv.slice(2);
              module.exports = f2;
            } else if (aa || ba) ba ? B = self.location.href : "undefined" != typeof document && document.currentScript && (B = document.currentScript.src), B = B.startsWith("blob:") ? "" : B.substr(0, B.replace(/[?#].*/, "").lastIndexOf("/") + 1), ba && (Ea = (a2) => {
              var b2 = new XMLHttpRequest();
              b2.open("GET", a2, false);
              b2.responseType = "arraybuffer";
              b2.send(null);
              return new Uint8Array(b2.response);
            }), Da = (a2) => Ga(a2) ? new Promise((b2, c2) => {
              var d2 = new XMLHttpRequest();
              d2.open("GET", a2, true);
              d2.responseType = "arraybuffer";
              d2.onload = () => {
                (200 == d2.status || 0 == d2.status && d2.response) && c2(d2.response);
                b2(d2.status);
              };
              d2.onerror = b2;
              d2.send(null);
            }) : fetch(a2, { credentials: "same-origin" }).then((b2) => b2.ok ? b2.arrayBuffer() : Promise.reject(Error(b2.status + " : " + b2.url)));
            var Ha = f2.print || console.log.bind(console), C = f2.printErr || console.error.bind(console);
            Object.assign(f2, Ba);
            Ba = null;
            f2.thisProgram && (Ca = f2.thisProgram);
            var Ia;
            f2.wasmBinary && (Ia = f2.wasmBinary);
            var Ja, Ka = false, p2, u2, La, D, F, Ma, Na;
            function Oa() {
              var a2 = Ja.buffer;
              f2.HEAP8 = p2 = new Int8Array(a2);
              f2.HEAP16 = La = new Int16Array(a2);
              f2.HEAPU8 = u2 = new Uint8Array(a2);
              f2.HEAPU16 = new Uint16Array(a2);
              f2.HEAP32 = D = new Int32Array(a2);
              f2.HEAPU32 = F = new Uint32Array(a2);
              f2.HEAPF32 = Ma = new Float32Array(a2);
              f2.HEAPF64 = Na = new Float64Array(a2);
            }
            var Pa = [], Qa = [], Sa = [];
            function Ta() {
              var a2 = f2.preRun.shift();
              Pa.unshift(a2);
            }
            var Ua = 0, Wa = null;
            function G(a2) {
              f2.onAbort?.(a2);
              a2 = "Aborted(" + a2 + ")";
              C(a2);
              Ka = true;
              throw new WebAssembly.RuntimeError(a2 + ". Build with -sASSERTIONS for more info.");
            }
            var Xa = (a2) => a2.startsWith("data:application/octet-stream;base64,"), Ga = (a2) => a2.startsWith("file://"), Ya;
            function Za(a2) {
              if (a2 == Ya && Ia) return new Uint8Array(Ia);
              if (Ea) return Ea(a2);
              throw "both async and sync fetching of the wasm failed";
            }
            function $a(a2) {
              return Ia ? Promise.resolve().then(() => Za(a2)) : Da(a2).then((b2) => new Uint8Array(b2), () => Za(a2));
            }
            function ab(a2, b2, c2) {
              return $a(a2).then((d2) => WebAssembly.instantiate(d2, b2)).then(c2, (d2) => {
                C(`failed to asynchronously prepare wasm: ${d2}`);
                G(d2);
              });
            }
            function bb(a2, b2) {
              var c2 = Ya;
              Ia || "function" != typeof WebAssembly.instantiateStreaming || Xa(c2) || Ga(c2) || ca || "function" != typeof fetch ? ab(c2, a2, b2) : fetch(c2, { credentials: "same-origin" }).then((d2) => WebAssembly.instantiateStreaming(d2, a2).then(b2, function(e2) {
                C(`wasm streaming compile failed: ${e2}`);
                C("falling back to ArrayBuffer instantiation");
                return ab(c2, a2, b2);
              }));
            }
            var I, J, cb = (a2) => {
              for (; 0 < a2.length; ) a2.shift()(f2);
            };
            function m2(a2, b2 = "i8") {
              b2.endsWith("*") && (b2 = "*");
              switch (b2) {
                case "i1":
                  return p2[a2];
                case "i8":
                  return p2[a2];
                case "i16":
                  return La[a2 >> 1];
                case "i32":
                  return D[a2 >> 2];
                case "i64":
                  G("to do getValue(i64) use WASM_BIGINT");
                case "float":
                  return Ma[a2 >> 2];
                case "double":
                  return Na[a2 >> 3];
                case "*":
                  return F[a2 >> 2];
                default:
                  G(`invalid type for getValue: ${b2}`);
              }
            }
            function sa(a2) {
              var b2 = "i32";
              b2.endsWith("*") && (b2 = "*");
              switch (b2) {
                case "i1":
                  p2[a2] = 0;
                  break;
                case "i8":
                  p2[a2] = 0;
                  break;
                case "i16":
                  La[a2 >> 1] = 0;
                  break;
                case "i32":
                  D[a2 >> 2] = 0;
                  break;
                case "i64":
                  G("to do setValue(i64) use WASM_BIGINT");
                case "float":
                  Ma[a2 >> 2] = 0;
                  break;
                case "double":
                  Na[a2 >> 3] = 0;
                  break;
                case "*":
                  F[a2 >> 2] = 0;
                  break;
                default:
                  G(`invalid type for setValue: ${b2}`);
              }
            }
            var db2 = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, L = (a2, b2, c2) => {
              var d2 = b2 + c2;
              for (c2 = b2; a2[c2] && !(c2 >= d2); ) ++c2;
              if (16 < c2 - b2 && a2.buffer && db2) return db2.decode(a2.subarray(b2, c2));
              for (d2 = ""; b2 < c2; ) {
                var e2 = a2[b2++];
                if (e2 & 128) {
                  var h3 = a2[b2++] & 63;
                  if (192 == (e2 & 224)) d2 += String.fromCharCode((e2 & 31) << 6 | h3);
                  else {
                    var k2 = a2[b2++] & 63;
                    e2 = 224 == (e2 & 240) ? (e2 & 15) << 12 | h3 << 6 | k2 : (e2 & 7) << 18 | h3 << 12 | k2 << 6 | a2[b2++] & 63;
                    65536 > e2 ? d2 += String.fromCharCode(e2) : (e2 -= 65536, d2 += String.fromCharCode(55296 | e2 >> 10, 56320 | e2 & 1023));
                  }
                } else d2 += String.fromCharCode(e2);
              }
              return d2;
            }, ta = (a2, b2) => a2 ? L(u2, a2, b2) : "", eb = (a2, b2) => {
              for (var c2 = 0, d2 = a2.length - 1; 0 <= d2; d2--) {
                var e2 = a2[d2];
                "." === e2 ? a2.splice(d2, 1) : ".." === e2 ? (a2.splice(d2, 1), c2++) : c2 && (a2.splice(d2, 1), c2--);
              }
              if (b2) for (; c2; c2--) a2.unshift("..");
              return a2;
            }, x = (a2) => {
              var b2 = "/" === a2.charAt(0), c2 = "/" === a2.substr(-1);
              (a2 = eb(a2.split("/").filter((d2) => !!d2), !b2).join("/")) || b2 || (a2 = ".");
              a2 && c2 && (a2 += "/");
              return (b2 ? "/" : "") + a2;
            }, fb = (a2) => {
              var b2 = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a2).slice(1);
              a2 = b2[0];
              b2 = b2[1];
              if (!a2 && !b2) return ".";
              b2 && (b2 = b2.substr(0, b2.length - 1));
              return a2 + b2;
            }, gb = (a2) => {
              if ("/" === a2) return "/";
              a2 = x(a2);
              a2 = a2.replace(/\/$/, "");
              var b2 = a2.lastIndexOf("/");
              return -1 === b2 ? a2 : a2.substr(b2 + 1);
            }, hb = () => {
              if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) return (c2) => crypto.getRandomValues(c2);
              if (ca) try {
                var a2 = __require("crypto");
                if (a2.randomFillSync) return (c2) => a2.randomFillSync(c2);
                var b2 = a2.randomBytes;
                return (c2) => (c2.set(b2(c2.byteLength)), c2);
              } catch (c2) {
              }
              G("initRandomDevice");
            }, jb = (a2) => (jb = hb())(a2), kb = (...a2) => {
              for (var b2 = "", c2 = false, d2 = a2.length - 1; -1 <= d2 && !c2; d2--) {
                c2 = 0 <= d2 ? a2[d2] : "/";
                if ("string" != typeof c2) throw new TypeError("Arguments to path.resolve must be strings");
                if (!c2) return "";
                b2 = c2 + "/" + b2;
                c2 = "/" === c2.charAt(0);
              }
              b2 = eb(b2.split("/").filter((e2) => !!e2), !c2).join("/");
              return (c2 ? "/" : "") + b2 || ".";
            }, sb = [], ha = (a2) => {
              for (var b2 = 0, c2 = 0; c2 < a2.length; ++c2) {
                var d2 = a2.charCodeAt(c2);
                127 >= d2 ? b2++ : 2047 >= d2 ? b2 += 2 : 55296 <= d2 && 57343 >= d2 ? (b2 += 4, ++c2) : b2 += 3;
              }
              return b2;
            }, q = (a2, b2, c2, d2) => {
              if (!(0 < d2)) return 0;
              var e2 = c2;
              d2 = c2 + d2 - 1;
              for (var h3 = 0; h3 < a2.length; ++h3) {
                var k2 = a2.charCodeAt(h3);
                if (55296 <= k2 && 57343 >= k2) {
                  var r = a2.charCodeAt(++h3);
                  k2 = 65536 + ((k2 & 1023) << 10) | r & 1023;
                }
                if (127 >= k2) {
                  if (c2 >= d2) break;
                  b2[c2++] = k2;
                } else {
                  if (2047 >= k2) {
                    if (c2 + 1 >= d2) break;
                    b2[c2++] = 192 | k2 >> 6;
                  } else {
                    if (65535 >= k2) {
                      if (c2 + 2 >= d2) break;
                      b2[c2++] = 224 | k2 >> 12;
                    } else {
                      if (c2 + 3 >= d2) break;
                      b2[c2++] = 240 | k2 >> 18;
                      b2[c2++] = 128 | k2 >> 12 & 63;
                    }
                    b2[c2++] = 128 | k2 >> 6 & 63;
                  }
                  b2[c2++] = 128 | k2 & 63;
                }
              }
              b2[c2] = 0;
              return c2 - e2;
            };
            function qa(a2, b2) {
              var c2 = Array(ha(a2) + 1);
              a2 = q(a2, c2, 0, c2.length);
              b2 && (c2.length = a2);
              return c2;
            }
            var tb = [];
            function ub(a2, b2) {
              tb[a2] = { input: [], output: [], Wa: b2 };
              vb(a2, wb);
            }
            var wb = { open(a2) {
              var b2 = tb[a2.node.rdev];
              if (!b2) throw new P2(43);
              a2.tty = b2;
              a2.seekable = false;
            }, close(a2) {
              a2.tty.Wa.fsync(a2.tty);
            }, fsync(a2) {
              a2.tty.Wa.fsync(a2.tty);
            }, read(a2, b2, c2, d2) {
              if (!a2.tty || !a2.tty.Wa.rb) throw new P2(60);
              for (var e2 = 0, h3 = 0; h3 < d2; h3++) {
                try {
                  var k2 = a2.tty.Wa.rb(a2.tty);
                } catch (r) {
                  throw new P2(29);
                }
                if (void 0 === k2 && 0 === e2) throw new P2(6);
                if (null === k2 || void 0 === k2) break;
                e2++;
                b2[c2 + h3] = k2;
              }
              e2 && (a2.node.timestamp = Date.now());
              return e2;
            }, write(a2, b2, c2, d2) {
              if (!a2.tty || !a2.tty.Wa.ib) throw new P2(60);
              try {
                for (var e2 = 0; e2 < d2; e2++) a2.tty.Wa.ib(a2.tty, b2[c2 + e2]);
              } catch (h3) {
                throw new P2(29);
              }
              d2 && (a2.node.timestamp = Date.now());
              return e2;
            } }, xb = { rb() {
              a: {
                if (!sb.length) {
                  var a2 = null;
                  if (ca) {
                    var b2 = Buffer2.alloc(256), c2 = 0, d2 = process.stdin.fd;
                    try {
                      c2 = fs.readSync(d2, b2, 0, 256);
                    } catch (e2) {
                      if (e2.toString().includes("EOF")) c2 = 0;
                      else throw e2;
                    }
                    0 < c2 && (a2 = b2.slice(0, c2).toString("utf-8"));
                  } else "undefined" != typeof window && "function" == typeof window.prompt && (a2 = window.prompt("Input: "), null !== a2 && (a2 += "\n"));
                  if (!a2) {
                    a2 = null;
                    break a;
                  }
                  sb = qa(a2, true);
                }
                a2 = sb.shift();
              }
              return a2;
            }, ib(a2, b2) {
              null === b2 || 10 === b2 ? (Ha(L(
                a2.output,
                0
              )), a2.output = []) : 0 != b2 && a2.output.push(b2);
            }, fsync(a2) {
              a2.output && 0 < a2.output.length && (Ha(L(a2.output, 0)), a2.output = []);
            }, Lb() {
              return { Gb: 25856, Ib: 5, Fb: 191, Hb: 35387, Eb: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
            }, Mb() {
              return 0;
            }, Nb() {
              return [24, 80];
            } }, yb = { ib(a2, b2) {
              null === b2 || 10 === b2 ? (C(L(a2.output, 0)), a2.output = []) : 0 != b2 && a2.output.push(b2);
            }, fsync(a2) {
              a2.output && 0 < a2.output.length && (C(L(a2.output, 0)), a2.output = []);
            } };
            function zb(a2, b2) {
              var c2 = a2.Ha ? a2.Ha.length : 0;
              c2 >= b2 || (b2 = Math.max(b2, c2 * (1048576 > c2 ? 2 : 1.125) >>> 0), 0 != c2 && (b2 = Math.max(b2, 256)), c2 = a2.Ha, a2.Ha = new Uint8Array(b2), 0 < a2.La && a2.Ha.set(c2.subarray(0, a2.La), 0));
            }
            var Q = {
              Pa: null,
              Qa() {
                return Q.createNode(null, "/", 16895, 0);
              },
              createNode(a2, b2, c2, d2) {
                if (24576 === (c2 & 61440) || 4096 === (c2 & 61440)) throw new P2(63);
                Q.Pa || (Q.Pa = { dir: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na, lookup: Q.Fa.lookup, $a: Q.Fa.$a, rename: Q.Fa.rename, unlink: Q.Fa.unlink, rmdir: Q.Fa.rmdir, readdir: Q.Fa.readdir, symlink: Q.Fa.symlink }, stream: { Sa: Q.Ga.Sa } }, file: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na }, stream: { Sa: Q.Ga.Sa, read: Q.Ga.read, write: Q.Ga.write, kb: Q.Ga.kb, ab: Q.Ga.ab, bb: Q.Ga.bb } }, link: {
                  node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na, readlink: Q.Fa.readlink },
                  stream: {}
                }, ob: { node: { Oa: Q.Fa.Oa, Na: Q.Fa.Na }, stream: Ab } });
                c2 = Bb(a2, b2, c2, d2);
                R(c2.mode) ? (c2.Fa = Q.Pa.dir.node, c2.Ga = Q.Pa.dir.stream, c2.Ha = {}) : 32768 === (c2.mode & 61440) ? (c2.Fa = Q.Pa.file.node, c2.Ga = Q.Pa.file.stream, c2.La = 0, c2.Ha = null) : 40960 === (c2.mode & 61440) ? (c2.Fa = Q.Pa.link.node, c2.Ga = Q.Pa.link.stream) : 8192 === (c2.mode & 61440) && (c2.Fa = Q.Pa.ob.node, c2.Ga = Q.Pa.ob.stream);
                c2.timestamp = Date.now();
                a2 && (a2.Ha[b2] = c2, a2.timestamp = c2.timestamp);
                return c2;
              },
              Kb(a2) {
                return a2.Ha ? a2.Ha.subarray ? a2.Ha.subarray(0, a2.La) : new Uint8Array(a2.Ha) : new Uint8Array(0);
              },
              Fa: { Oa(a2) {
                var b2 = {};
                b2.dev = 8192 === (a2.mode & 61440) ? a2.id : 1;
                b2.ino = a2.id;
                b2.mode = a2.mode;
                b2.nlink = 1;
                b2.uid = 0;
                b2.gid = 0;
                b2.rdev = a2.rdev;
                R(a2.mode) ? b2.size = 4096 : 32768 === (a2.mode & 61440) ? b2.size = a2.La : 40960 === (a2.mode & 61440) ? b2.size = a2.link.length : b2.size = 0;
                b2.atime = new Date(a2.timestamp);
                b2.mtime = new Date(a2.timestamp);
                b2.ctime = new Date(a2.timestamp);
                b2.yb = 4096;
                b2.blocks = Math.ceil(b2.size / b2.yb);
                return b2;
              }, Na(a2, b2) {
                void 0 !== b2.mode && (a2.mode = b2.mode);
                void 0 !== b2.timestamp && (a2.timestamp = b2.timestamp);
                if (void 0 !== b2.size && (b2 = b2.size, a2.La != b2)) if (0 == b2) a2.Ha = null, a2.La = 0;
                else {
                  var c2 = a2.Ha;
                  a2.Ha = new Uint8Array(b2);
                  c2 && a2.Ha.set(c2.subarray(0, Math.min(b2, a2.La)));
                  a2.La = b2;
                }
              }, lookup() {
                throw Cb[44];
              }, $a(a2, b2, c2, d2) {
                return Q.createNode(a2, b2, c2, d2);
              }, rename(a2, b2, c2) {
                if (R(a2.mode)) {
                  try {
                    var d2 = Db(b2, c2);
                  } catch (h3) {
                  }
                  if (d2) for (var e2 in d2.Ha) throw new P2(55);
                }
                delete a2.parent.Ha[a2.name];
                a2.parent.timestamp = Date.now();
                a2.name = c2;
                b2.Ha[c2] = a2;
                b2.timestamp = a2.parent.timestamp;
              }, unlink(a2, b2) {
                delete a2.Ha[b2];
                a2.timestamp = Date.now();
              }, rmdir(a2, b2) {
                var c2 = Db(a2, b2), d2;
                for (d2 in c2.Ha) throw new P2(55);
                delete a2.Ha[b2];
                a2.timestamp = Date.now();
              }, readdir(a2) {
                var b2 = [".", ".."], c2;
                for (c2 of Object.keys(a2.Ha)) b2.push(c2);
                return b2;
              }, symlink(a2, b2, c2) {
                a2 = Q.createNode(a2, b2, 41471, 0);
                a2.link = c2;
                return a2;
              }, readlink(a2) {
                if (40960 !== (a2.mode & 61440)) throw new P2(28);
                return a2.link;
              } },
              Ga: {
                read(a2, b2, c2, d2, e2) {
                  var h3 = a2.node.Ha;
                  if (e2 >= a2.node.La) return 0;
                  a2 = Math.min(a2.node.La - e2, d2);
                  if (8 < a2 && h3.subarray) b2.set(h3.subarray(e2, e2 + a2), c2);
                  else for (d2 = 0; d2 < a2; d2++) b2[c2 + d2] = h3[e2 + d2];
                  return a2;
                },
                write(a2, b2, c2, d2, e2, h3) {
                  b2.buffer === p2.buffer && (h3 = false);
                  if (!d2) return 0;
                  a2 = a2.node;
                  a2.timestamp = Date.now();
                  if (b2.subarray && (!a2.Ha || a2.Ha.subarray)) {
                    if (h3) return a2.Ha = b2.subarray(c2, c2 + d2), a2.La = d2;
                    if (0 === a2.La && 0 === e2) return a2.Ha = b2.slice(c2, c2 + d2), a2.La = d2;
                    if (e2 + d2 <= a2.La) return a2.Ha.set(b2.subarray(c2, c2 + d2), e2), d2;
                  }
                  zb(a2, e2 + d2);
                  if (a2.Ha.subarray && b2.subarray) a2.Ha.set(b2.subarray(c2, c2 + d2), e2);
                  else for (h3 = 0; h3 < d2; h3++) a2.Ha[e2 + h3] = b2[c2 + h3];
                  a2.La = Math.max(a2.La, e2 + d2);
                  return d2;
                },
                Sa(a2, b2, c2) {
                  1 === c2 ? b2 += a2.position : 2 === c2 && 32768 === (a2.node.mode & 61440) && (b2 += a2.node.La);
                  if (0 > b2) throw new P2(28);
                  return b2;
                },
                kb(a2, b2, c2) {
                  zb(a2.node, b2 + c2);
                  a2.node.La = Math.max(a2.node.La, b2 + c2);
                },
                ab(a2, b2, c2, d2, e2) {
                  if (32768 !== (a2.node.mode & 61440)) throw new P2(43);
                  a2 = a2.node.Ha;
                  if (e2 & 2 || a2.buffer !== p2.buffer) {
                    if (0 < c2 || c2 + b2 < a2.length) a2.subarray ? a2 = a2.subarray(c2, c2 + b2) : a2 = Array.prototype.slice.call(a2, c2, c2 + b2);
                    c2 = true;
                    b2 = 65536 * Math.ceil(b2 / 65536);
                    (e2 = Eb(65536, b2)) ? (u2.fill(0, e2, e2 + b2), b2 = e2) : b2 = 0;
                    if (!b2) throw new P2(48);
                    p2.set(a2, b2);
                  } else c2 = false, b2 = a2.byteOffset;
                  return { Cb: b2, tb: c2 };
                },
                bb(a2, b2, c2, d2) {
                  Q.Ga.write(a2, b2, 0, d2, c2, false);
                  return 0;
                }
              }
            }, ka = (a2, b2) => {
              var c2 = 0;
              a2 && (c2 |= 365);
              b2 && (c2 |= 146);
              return c2;
            }, Fb = null, Gb = {}, Hb = [], Ib = 1, S = null, Jb = true, P2 = class {
              constructor(a2) {
                this.name = "ErrnoError";
                this.Ja = a2;
              }
            }, Cb = {}, Kb = class {
              constructor() {
                this.Za = {};
                this.node = null;
              }
              get flags() {
                return this.Za.flags;
              }
              set flags(a2) {
                this.Za.flags = a2;
              }
              get position() {
                return this.Za.position;
              }
              set position(a2) {
                this.Za.position = a2;
              }
            }, Lb = class {
              constructor(a2, b2, c2, d2) {
                a2 || (a2 = this);
                this.parent = a2;
                this.Qa = a2.Qa;
                this.Ua = null;
                this.id = Ib++;
                this.name = b2;
                this.mode = c2;
                this.Fa = {};
                this.Ga = {};
                this.rdev = d2;
              }
              get read() {
                return 365 === (this.mode & 365);
              }
              set read(a2) {
                a2 ? this.mode |= 365 : this.mode &= -366;
              }
              get write() {
                return 146 === (this.mode & 146);
              }
              set write(a2) {
                a2 ? this.mode |= 146 : this.mode &= -147;
              }
            };
            function T(a2, b2 = {}) {
              a2 = kb(a2);
              if (!a2) return { path: "", node: null };
              b2 = Object.assign({ pb: true, jb: 0 }, b2);
              if (8 < b2.jb) throw new P2(32);
              a2 = a2.split("/").filter((k2) => !!k2);
              for (var c2 = Fb, d2 = "/", e2 = 0; e2 < a2.length; e2++) {
                var h3 = e2 === a2.length - 1;
                if (h3 && b2.parent) break;
                c2 = Db(c2, a2[e2]);
                d2 = x(d2 + "/" + a2[e2]);
                c2.Ua && (!h3 || h3 && b2.pb) && (c2 = c2.Ua.root);
                if (!h3 || b2.Ra) {
                  for (h3 = 0; 40960 === (c2.mode & 61440); ) if (c2 = Mb(d2), d2 = kb(fb(d2), c2), c2 = T(d2, { jb: b2.jb + 1 }).node, 40 < h3++) throw new P2(32);
                }
              }
              return { path: d2, node: c2 };
            }
            function ja(a2) {
              for (var b2; ; ) {
                if (a2 === a2.parent) return a2 = a2.Qa.sb, b2 ? "/" !== a2[a2.length - 1] ? `${a2}/${b2}` : a2 + b2 : a2;
                b2 = b2 ? `${a2.name}/${b2}` : a2.name;
                a2 = a2.parent;
              }
            }
            function Nb(a2, b2) {
              for (var c2 = 0, d2 = 0; d2 < b2.length; d2++) c2 = (c2 << 5) - c2 + b2.charCodeAt(d2) | 0;
              return (a2 + c2 >>> 0) % S.length;
            }
            function Ob(a2) {
              var b2 = Nb(a2.parent.id, a2.name);
              if (S[b2] === a2) S[b2] = a2.Va;
              else for (b2 = S[b2]; b2; ) {
                if (b2.Va === a2) {
                  b2.Va = a2.Va;
                  break;
                }
                b2 = b2.Va;
              }
            }
            function Db(a2, b2) {
              var c2 = R(a2.mode) ? (c2 = Pb(a2, "x")) ? c2 : a2.Fa.lookup ? 0 : 2 : 54;
              if (c2) throw new P2(c2);
              for (c2 = S[Nb(a2.id, b2)]; c2; c2 = c2.Va) {
                var d2 = c2.name;
                if (c2.parent.id === a2.id && d2 === b2) return c2;
              }
              return a2.Fa.lookup(a2, b2);
            }
            function Bb(a2, b2, c2, d2) {
              a2 = new Lb(a2, b2, c2, d2);
              b2 = Nb(a2.parent.id, a2.name);
              a2.Va = S[b2];
              return S[b2] = a2;
            }
            function R(a2) {
              return 16384 === (a2 & 61440);
            }
            function Qb(a2) {
              var b2 = ["r", "w", "rw"][a2 & 3];
              a2 & 512 && (b2 += "w");
              return b2;
            }
            function Pb(a2, b2) {
              if (Jb) return 0;
              if (!b2.includes("r") || a2.mode & 292) {
                if (b2.includes("w") && !(a2.mode & 146) || b2.includes("x") && !(a2.mode & 73)) return 2;
              } else return 2;
              return 0;
            }
            function Rb(a2, b2) {
              try {
                return Db(a2, b2), 20;
              } catch (c2) {
              }
              return Pb(a2, "wx");
            }
            function Sb(a2, b2, c2) {
              try {
                var d2 = Db(a2, b2);
              } catch (e2) {
                return e2.Ja;
              }
              if (a2 = Pb(a2, "wx")) return a2;
              if (c2) {
                if (!R(d2.mode)) return 54;
                if (d2 === d2.parent || "/" === ja(d2)) return 10;
              } else if (R(d2.mode)) return 31;
              return 0;
            }
            function U(a2) {
              a2 = Hb[a2];
              if (!a2) throw new P2(8);
              return a2;
            }
            function Tb(a2, b2 = -1) {
              a2 = Object.assign(new Kb(), a2);
              if (-1 == b2) a: {
                for (b2 = 0; 4096 >= b2; b2++) if (!Hb[b2]) break a;
                throw new P2(33);
              }
              a2.fd = b2;
              return Hb[b2] = a2;
            }
            function Ub(a2, b2 = -1) {
              a2 = Tb(a2, b2);
              a2.Ga?.Jb?.(a2);
              return a2;
            }
            var Ab = { open(a2) {
              a2.Ga = Gb[a2.node.rdev].Ga;
              a2.Ga.open?.(a2);
            }, Sa() {
              throw new P2(70);
            } };
            function vb(a2, b2) {
              Gb[a2] = { Ga: b2 };
            }
            function Vb(a2, b2) {
              var c2 = "/" === b2;
              if (c2 && Fb) throw new P2(10);
              if (!c2 && b2) {
                var d2 = T(b2, { pb: false });
                b2 = d2.path;
                d2 = d2.node;
                if (d2.Ua) throw new P2(10);
                if (!R(d2.mode)) throw new P2(54);
              }
              b2 = { type: a2, Ob: {}, sb: b2, Bb: [] };
              a2 = a2.Qa(b2);
              a2.Qa = b2;
              b2.root = a2;
              c2 ? Fb = a2 : d2 && (d2.Ua = b2, d2.Qa && d2.Qa.Bb.push(b2));
            }
            function la(a2, b2, c2) {
              var d2 = T(a2, { parent: true }).node;
              a2 = gb(a2);
              if (!a2 || "." === a2 || ".." === a2) throw new P2(28);
              var e2 = Rb(d2, a2);
              if (e2) throw new P2(e2);
              if (!d2.Fa.$a) throw new P2(63);
              return d2.Fa.$a(d2, a2, b2, c2);
            }
            function V(a2, b2) {
              return la(a2, (void 0 !== b2 ? b2 : 511) & 1023 | 16384, 0);
            }
            function Wb(a2, b2, c2) {
              "undefined" == typeof c2 && (c2 = b2, b2 = 438);
              la(a2, b2 | 8192, c2);
            }
            function Xb(a2, b2) {
              if (!kb(a2)) throw new P2(44);
              var c2 = T(b2, { parent: true }).node;
              if (!c2) throw new P2(44);
              b2 = gb(b2);
              var d2 = Rb(c2, b2);
              if (d2) throw new P2(d2);
              if (!c2.Fa.symlink) throw new P2(63);
              c2.Fa.symlink(c2, b2, a2);
            }
            function Yb(a2) {
              var b2 = T(a2, { parent: true }).node;
              a2 = gb(a2);
              var c2 = Db(b2, a2), d2 = Sb(b2, a2, true);
              if (d2) throw new P2(d2);
              if (!b2.Fa.rmdir) throw new P2(63);
              if (c2.Ua) throw new P2(10);
              b2.Fa.rmdir(b2, a2);
              Ob(c2);
            }
            function za(a2) {
              var b2 = T(a2, { parent: true }).node;
              if (!b2) throw new P2(44);
              a2 = gb(a2);
              var c2 = Db(b2, a2), d2 = Sb(b2, a2, false);
              if (d2) throw new P2(d2);
              if (!b2.Fa.unlink) throw new P2(63);
              if (c2.Ua) throw new P2(10);
              b2.Fa.unlink(b2, a2);
              Ob(c2);
            }
            function Mb(a2) {
              a2 = T(a2).node;
              if (!a2) throw new P2(44);
              if (!a2.Fa.readlink) throw new P2(28);
              return kb(ja(a2.parent), a2.Fa.readlink(a2));
            }
            function Zb(a2, b2) {
              a2 = T(a2, { Ra: !b2 }).node;
              if (!a2) throw new P2(44);
              if (!a2.Fa.Oa) throw new P2(63);
              return a2.Fa.Oa(a2);
            }
            function $b(a2) {
              return Zb(a2, true);
            }
            function ma(a2, b2) {
              a2 = "string" == typeof a2 ? T(a2, { Ra: true }).node : a2;
              if (!a2.Fa.Na) throw new P2(63);
              a2.Fa.Na(a2, { mode: b2 & 4095 | a2.mode & -4096, timestamp: Date.now() });
            }
            function ac(a2, b2) {
              if (0 > b2) throw new P2(28);
              a2 = "string" == typeof a2 ? T(a2, { Ra: true }).node : a2;
              if (!a2.Fa.Na) throw new P2(63);
              if (R(a2.mode)) throw new P2(31);
              if (32768 !== (a2.mode & 61440)) throw new P2(28);
              var c2 = Pb(a2, "w");
              if (c2) throw new P2(c2);
              a2.Fa.Na(a2, { size: b2, timestamp: Date.now() });
            }
            function na(a2, b2, c2) {
              if ("" === a2) throw new P2(44);
              if ("string" == typeof b2) {
                var d2 = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b2];
                if ("undefined" == typeof d2) throw Error(`Unknown file open mode: ${b2}`);
                b2 = d2;
              }
              c2 = b2 & 64 ? ("undefined" == typeof c2 ? 438 : c2) & 4095 | 32768 : 0;
              if ("object" == typeof a2) var e2 = a2;
              else {
                a2 = x(a2);
                try {
                  e2 = T(a2, { Ra: !(b2 & 131072) }).node;
                } catch (h3) {
                }
              }
              d2 = false;
              if (b2 & 64) if (e2) {
                if (b2 & 128) throw new P2(20);
              } else e2 = la(a2, c2, 0), d2 = true;
              if (!e2) throw new P2(44);
              8192 === (e2.mode & 61440) && (b2 &= -513);
              if (b2 & 65536 && !R(e2.mode)) throw new P2(54);
              if (!d2 && (c2 = e2 ? 40960 === (e2.mode & 61440) ? 32 : R(e2.mode) && ("r" !== Qb(b2) || b2 & 512) ? 31 : Pb(e2, Qb(b2)) : 44)) throw new P2(c2);
              b2 & 512 && !d2 && ac(e2, 0);
              b2 &= -131713;
              e2 = Tb({ node: e2, path: ja(e2), flags: b2, seekable: true, position: 0, Ga: e2.Ga, Db: [], error: false });
              e2.Ga.open && e2.Ga.open(e2);
              !f2.logReadFiles || b2 & 1 || (bc || (bc = {}), a2 in bc || (bc[a2] = 1));
              return e2;
            }
            function pa(a2) {
              if (null === a2.fd) throw new P2(8);
              a2.gb && (a2.gb = null);
              try {
                a2.Ga.close && a2.Ga.close(a2);
              } catch (b2) {
                throw b2;
              } finally {
                Hb[a2.fd] = null;
              }
              a2.fd = null;
            }
            function cc(a2, b2, c2) {
              if (null === a2.fd) throw new P2(8);
              if (!a2.seekable || !a2.Ga.Sa) throw new P2(70);
              if (0 != c2 && 1 != c2 && 2 != c2) throw new P2(28);
              a2.position = a2.Ga.Sa(a2, b2, c2);
              a2.Db = [];
            }
            function dc(a2, b2, c2, d2, e2) {
              if (0 > d2 || 0 > e2) throw new P2(28);
              if (null === a2.fd) throw new P2(8);
              if (1 === (a2.flags & 2097155)) throw new P2(8);
              if (R(a2.node.mode)) throw new P2(31);
              if (!a2.Ga.read) throw new P2(28);
              var h3 = "undefined" != typeof e2;
              if (!h3) e2 = a2.position;
              else if (!a2.seekable) throw new P2(70);
              b2 = a2.Ga.read(a2, b2, c2, d2, e2);
              h3 || (a2.position += b2);
              return b2;
            }
            function oa(a2, b2, c2, d2, e2) {
              if (0 > d2 || 0 > e2) throw new P2(28);
              if (null === a2.fd) throw new P2(8);
              if (0 === (a2.flags & 2097155)) throw new P2(8);
              if (R(a2.node.mode)) throw new P2(31);
              if (!a2.Ga.write) throw new P2(28);
              a2.seekable && a2.flags & 1024 && cc(a2, 0, 2);
              var h3 = "undefined" != typeof e2;
              if (!h3) e2 = a2.position;
              else if (!a2.seekable) throw new P2(70);
              b2 = a2.Ga.write(a2, b2, c2, d2, e2, void 0);
              h3 || (a2.position += b2);
              return b2;
            }
            function ya(a2) {
              var c2;
              var d2 = na(a2, d2 || 0);
              a2 = Zb(a2).size;
              var e2 = new Uint8Array(a2);
              dc(d2, e2, 0, a2, 0);
              c2 = e2;
              pa(d2);
              return c2;
            }
            var ec;
            function Fc(a2, b2, c2) {
              a2 = x("/dev/" + a2);
              var d2 = ka(!!b2, !!c2);
              Hc || (Hc = 64);
              var e2 = Hc++ << 8 | 0;
              vb(e2, { open(h3) {
                h3.seekable = false;
              }, close() {
                c2?.buffer?.length && c2(10);
              }, read(h3, k2, r, z) {
                for (var v3 = 0, E = 0; E < z; E++) {
                  try {
                    var H = b2();
                  } catch (mb) {
                    throw new P2(29);
                  }
                  if (void 0 === H && 0 === v3) throw new P2(6);
                  if (null === H || void 0 === H) break;
                  v3++;
                  k2[r + E] = H;
                }
                v3 && (h3.node.timestamp = Date.now());
                return v3;
              }, write(h3, k2, r, z) {
                for (var v3 = 0; v3 < z; v3++) try {
                  c2(k2[r + v3]);
                } catch (E) {
                  throw new P2(29);
                }
                z && (h3.node.timestamp = Date.now());
                return v3;
              } });
              Wb(a2, d2, e2);
            }
            var Hc, W = {}, bc;
            function Ic(a2, b2, c2) {
              if ("/" === b2.charAt(0)) return b2;
              a2 = -100 === a2 ? "/" : U(a2).path;
              if (0 == b2.length) {
                if (!c2) throw new P2(44);
                return a2;
              }
              return x(a2 + "/" + b2);
            }
            function Jc(a2, b2, c2) {
              a2 = a2(b2);
              D[c2 >> 2] = a2.dev;
              D[c2 + 4 >> 2] = a2.mode;
              F[c2 + 8 >> 2] = a2.nlink;
              D[c2 + 12 >> 2] = a2.uid;
              D[c2 + 16 >> 2] = a2.gid;
              D[c2 + 20 >> 2] = a2.rdev;
              J = [a2.size >>> 0, (I = a2.size, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
              D[c2 + 24 >> 2] = J[0];
              D[c2 + 28 >> 2] = J[1];
              D[c2 + 32 >> 2] = 4096;
              D[c2 + 36 >> 2] = a2.blocks;
              b2 = a2.atime.getTime();
              var d2 = a2.mtime.getTime(), e2 = a2.ctime.getTime();
              J = [Math.floor(b2 / 1e3) >>> 0, (I = Math.floor(b2 / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
              D[c2 + 40 >> 2] = J[0];
              D[c2 + 44 >> 2] = J[1];
              F[c2 + 48 >> 2] = b2 % 1e3 * 1e3;
              J = [Math.floor(d2 / 1e3) >>> 0, (I = Math.floor(d2 / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
              D[c2 + 56 >> 2] = J[0];
              D[c2 + 60 >> 2] = J[1];
              F[c2 + 64 >> 2] = d2 % 1e3 * 1e3;
              J = [Math.floor(e2 / 1e3) >>> 0, (I = Math.floor(e2 / 1e3), 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
              D[c2 + 72 >> 2] = J[0];
              D[c2 + 76 >> 2] = J[1];
              F[c2 + 80 >> 2] = e2 % 1e3 * 1e3;
              J = [a2.ino >>> 0, (I = a2.ino, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
              D[c2 + 88 >> 2] = J[0];
              D[c2 + 92 >> 2] = J[1];
              return 0;
            }
            var Kc = void 0;
            function Lc() {
              var a2 = D[+Kc >> 2];
              Kc += 4;
              return a2;
            }
            var Mc = (a2, b2) => b2 + 2097152 >>> 0 < 4194305 - !!a2 ? (a2 >>> 0) + 4294967296 * b2 : NaN, Nc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Oc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Pc = {}, Rc = () => {
              if (!Qc) {
                var a2 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: Ca || "./this.program" }, b2;
                for (b2 in Pc) void 0 === Pc[b2] ? delete a2[b2] : a2[b2] = Pc[b2];
                var c2 = [];
                for (b2 in a2) c2.push(`${b2}=${a2[b2]}`);
                Qc = c2;
              }
              return Qc;
            }, Qc, va = (a2) => {
              var b2 = ha(a2) + 1, c2 = y2(b2);
              q(a2, u2, c2, b2);
              return c2;
            }, Sc = (a2, b2, c2, d2) => {
              var e2 = { string: (v3) => {
                var E = 0;
                null !== v3 && void 0 !== v3 && 0 !== v3 && (E = va(v3));
                return E;
              }, array: (v3) => {
                var E = y2(v3.length);
                p2.set(v3, E);
                return E;
              } };
              a2 = f2["_" + a2];
              var h3 = [], k2 = 0;
              if (d2) for (var r = 0; r < d2.length; r++) {
                var z = e2[c2[r]];
                z ? (0 === k2 && (k2 = ra()), h3[r] = z(d2[r])) : h3[r] = d2[r];
              }
              c2 = a2(...h3);
              return c2 = (function(v3) {
                0 !== k2 && ua(k2);
                return "string" === b2 ? v3 ? L(u2, v3) : "" : "boolean" === b2 ? !!v3 : v3;
              })(c2);
            }, ea = 0, da = (a2, b2) => {
              b2 = 1 == b2 ? y2(a2.length) : ia(a2.length);
              a2.subarray || a2.slice || (a2 = new Uint8Array(a2));
              u2.set(
                a2,
                b2
              );
              return b2;
            }, Tc, Uc = [], X, wa = (a2) => {
              Tc.delete(X.get(a2));
              X.set(a2, null);
              Uc.push(a2);
            }, Aa = (a2, b2) => {
              if (!Tc) {
                Tc = /* @__PURE__ */ new WeakMap();
                var c2 = X.length;
                if (Tc) for (var d2 = 0; d2 < 0 + c2; d2++) {
                  var e2 = X.get(d2);
                  e2 && Tc.set(e2, d2);
                }
              }
              if (c2 = Tc.get(a2) || 0) return c2;
              if (Uc.length) c2 = Uc.pop();
              else {
                try {
                  X.grow(1);
                } catch (r) {
                  if (!(r instanceof RangeError)) throw r;
                  throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
                }
                c2 = X.length - 1;
              }
              try {
                X.set(c2, a2);
              } catch (r) {
                if (!(r instanceof TypeError)) throw r;
                if ("function" == typeof WebAssembly.Function) {
                  d2 = WebAssembly.Function;
                  e2 = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
                  for (var h3 = { parameters: [], results: "v" == b2[0] ? [] : [e2[b2[0]]] }, k2 = 1; k2 < b2.length; ++k2) h3.parameters.push(e2[b2[k2]]);
                  b2 = new d2(h3, a2);
                } else {
                  d2 = [1];
                  e2 = b2.slice(0, 1);
                  b2 = b2.slice(1);
                  h3 = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
                  d2.push(96);
                  k2 = b2.length;
                  128 > k2 ? d2.push(k2) : d2.push(k2 % 128 | 128, k2 >> 7);
                  for (k2 = 0; k2 < b2.length; ++k2) d2.push(h3[b2[k2]]);
                  "v" == e2 ? d2.push(0) : d2.push(1, h3[e2]);
                  b2 = [0, 97, 115, 109, 1, 0, 0, 0, 1];
                  e2 = d2.length;
                  128 > e2 ? b2.push(e2) : b2.push(e2 % 128 | 128, e2 >> 7);
                  b2.push(...d2);
                  b2.push(
                    2,
                    7,
                    1,
                    1,
                    101,
                    1,
                    102,
                    0,
                    0,
                    7,
                    5,
                    1,
                    1,
                    102,
                    0,
                    0
                  );
                  b2 = new WebAssembly.Module(new Uint8Array(b2));
                  b2 = new WebAssembly.Instance(b2, { e: { f: a2 } }).exports.f;
                }
                X.set(c2, b2);
              }
              Tc.set(a2, c2);
              return c2;
            };
            [44].forEach((a2) => {
              Cb[a2] = new P2(a2);
              Cb[a2].stack = "<generic error, no stack>";
            });
            S = Array(4096);
            Vb(Q, "/");
            V("/tmp");
            V("/home");
            V("/home/web_user");
            (function() {
              V("/dev");
              vb(259, { read: () => 0, write: (d2, e2, h3, k2) => k2 });
              Wb("/dev/null", 259);
              ub(1280, xb);
              ub(1536, yb);
              Wb("/dev/tty", 1280);
              Wb("/dev/tty1", 1536);
              var a2 = new Uint8Array(1024), b2 = 0, c2 = () => {
                0 === b2 && (b2 = jb(a2).byteLength);
                return a2[--b2];
              };
              Fc("random", c2);
              Fc("urandom", c2);
              V("/dev/shm");
              V("/dev/shm/tmp");
            })();
            (function() {
              V("/proc");
              var a2 = V("/proc/self");
              V("/proc/self/fd");
              Vb({ Qa() {
                var b2 = Bb(a2, "fd", 16895, 73);
                b2.Fa = { lookup(c2, d2) {
                  var e2 = U(+d2);
                  c2 = { parent: null, Qa: { sb: "fake" }, Fa: { readlink: () => e2.path } };
                  return c2.parent = c2;
                } };
                return b2;
              } }, "/proc/self/fd");
            })();
            var Vc = {
              a: (a2, b2, c2, d2) => {
                G(`Assertion failed: ${a2 ? L(u2, a2) : ""}, at: ` + [b2 ? b2 ? L(u2, b2) : "" : "unknown filename", c2, d2 ? d2 ? L(u2, d2) : "" : "unknown function"]);
              },
              h: function(a2, b2) {
                try {
                  return a2 = a2 ? L(u2, a2) : "", ma(a2, b2), 0;
                } catch (c2) {
                  if ("undefined" == typeof W || "ErrnoError" !== c2.name) throw c2;
                  return -c2.Ja;
                }
              },
              H: function(a2, b2, c2) {
                try {
                  b2 = b2 ? L(u2, b2) : "";
                  b2 = Ic(a2, b2);
                  if (c2 & -8) return -28;
                  var d2 = T(b2, { Ra: true }).node;
                  if (!d2) return -44;
                  a2 = "";
                  c2 & 4 && (a2 += "r");
                  c2 & 2 && (a2 += "w");
                  c2 & 1 && (a2 += "x");
                  return a2 && Pb(d2, a2) ? -2 : 0;
                } catch (e2) {
                  if ("undefined" == typeof W || "ErrnoError" !== e2.name) throw e2;
                  return -e2.Ja;
                }
              },
              i: function(a2, b2) {
                try {
                  var c2 = U(a2);
                  ma(c2.node, b2);
                  return 0;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              g: function(a2) {
                try {
                  var b2 = U(a2).node;
                  var c2 = "string" == typeof b2 ? T(b2, { Ra: true }).node : b2;
                  if (!c2.Fa.Na) throw new P2(63);
                  c2.Fa.Na(c2, { timestamp: Date.now() });
                  return 0;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              b: function(a2, b2, c2) {
                Kc = c2;
                try {
                  var d2 = U(a2);
                  switch (b2) {
                    case 0:
                      var e2 = Lc();
                      if (0 > e2) break;
                      for (; Hb[e2]; ) e2++;
                      return Ub(d2, e2).fd;
                    case 1:
                    case 2:
                      return 0;
                    case 3:
                      return d2.flags;
                    case 4:
                      return e2 = Lc(), d2.flags |= e2, 0;
                    case 12:
                      return e2 = Lc(), La[e2 + 0 >> 1] = 2, 0;
                    case 13:
                    case 14:
                      return 0;
                  }
                  return -28;
                } catch (h3) {
                  if ("undefined" == typeof W || "ErrnoError" !== h3.name) throw h3;
                  return -h3.Ja;
                }
              },
              f: function(a2, b2) {
                try {
                  var c2 = U(a2);
                  return Jc(Zb, c2.path, b2);
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              n: function(a2, b2, c2) {
                b2 = Mc(b2, c2);
                try {
                  if (isNaN(b2)) return 61;
                  var d2 = U(a2);
                  if (0 === (d2.flags & 2097155)) throw new P2(28);
                  ac(d2.node, b2);
                  return 0;
                } catch (e2) {
                  if ("undefined" == typeof W || "ErrnoError" !== e2.name) throw e2;
                  return -e2.Ja;
                }
              },
              C: function(a2, b2) {
                try {
                  if (0 === b2) return -28;
                  var c2 = ha("/") + 1;
                  if (b2 < c2) return -68;
                  q("/", u2, a2, b2);
                  return c2;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              F: function(a2, b2) {
                try {
                  return a2 = a2 ? L(u2, a2) : "", Jc($b, a2, b2);
                } catch (c2) {
                  if ("undefined" == typeof W || "ErrnoError" !== c2.name) throw c2;
                  return -c2.Ja;
                }
              },
              z: function(a2, b2, c2) {
                try {
                  return b2 = b2 ? L(u2, b2) : "", b2 = Ic(a2, b2), b2 = x(b2), "/" === b2[b2.length - 1] && (b2 = b2.substr(0, b2.length - 1)), V(b2, c2), 0;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              E: function(a2, b2, c2, d2) {
                try {
                  b2 = b2 ? L(u2, b2) : "";
                  var e2 = d2 & 256;
                  b2 = Ic(a2, b2, d2 & 4096);
                  return Jc(e2 ? $b : Zb, b2, c2);
                } catch (h3) {
                  if ("undefined" == typeof W || "ErrnoError" !== h3.name) throw h3;
                  return -h3.Ja;
                }
              },
              x: function(a2, b2, c2, d2) {
                Kc = d2;
                try {
                  b2 = b2 ? L(u2, b2) : "";
                  b2 = Ic(a2, b2);
                  var e2 = d2 ? Lc() : 0;
                  return na(b2, c2, e2).fd;
                } catch (h3) {
                  if ("undefined" == typeof W || "ErrnoError" !== h3.name) throw h3;
                  return -h3.Ja;
                }
              },
              v: function(a2, b2, c2, d2) {
                try {
                  b2 = b2 ? L(u2, b2) : "";
                  b2 = Ic(a2, b2);
                  if (0 >= d2) return -28;
                  var e2 = Mb(b2), h3 = Math.min(d2, ha(e2)), k2 = p2[c2 + h3];
                  q(e2, u2, c2, d2 + 1);
                  p2[c2 + h3] = k2;
                  return h3;
                } catch (r) {
                  if ("undefined" == typeof W || "ErrnoError" !== r.name) throw r;
                  return -r.Ja;
                }
              },
              u: function(a2) {
                try {
                  return a2 = a2 ? L(u2, a2) : "", Yb(a2), 0;
                } catch (b2) {
                  if ("undefined" == typeof W || "ErrnoError" !== b2.name) throw b2;
                  return -b2.Ja;
                }
              },
              G: function(a2, b2) {
                try {
                  return a2 = a2 ? L(u2, a2) : "", Jc(Zb, a2, b2);
                } catch (c2) {
                  if ("undefined" == typeof W || "ErrnoError" !== c2.name) throw c2;
                  return -c2.Ja;
                }
              },
              r: function(a2, b2, c2) {
                try {
                  return b2 = b2 ? L(u2, b2) : "", b2 = Ic(a2, b2), 0 === c2 ? za(b2) : 512 === c2 ? Yb(b2) : G("Invalid flags passed to unlinkat"), 0;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return -d2.Ja;
                }
              },
              q: function(a2, b2, c2) {
                try {
                  b2 = b2 ? L(u2, b2) : "";
                  b2 = Ic(a2, b2, true);
                  if (c2) {
                    var d2 = F[c2 >> 2] + 4294967296 * D[c2 + 4 >> 2], e2 = D[c2 + 8 >> 2];
                    h3 = 1e3 * d2 + e2 / 1e6;
                    c2 += 16;
                    d2 = F[c2 >> 2] + 4294967296 * D[c2 + 4 >> 2];
                    e2 = D[c2 + 8 >> 2];
                    k2 = 1e3 * d2 + e2 / 1e6;
                  } else var h3 = Date.now(), k2 = h3;
                  a2 = h3;
                  var r = T(b2, { Ra: true }).node;
                  r.Fa.Na(r, { timestamp: Math.max(a2, k2) });
                  return 0;
                } catch (z) {
                  if ("undefined" == typeof W || "ErrnoError" !== z.name) throw z;
                  return -z.Ja;
                }
              },
              l: function(a2, b2, c2) {
                a2 = new Date(1e3 * Mc(a2, b2));
                D[c2 >> 2] = a2.getSeconds();
                D[c2 + 4 >> 2] = a2.getMinutes();
                D[c2 + 8 >> 2] = a2.getHours();
                D[c2 + 12 >> 2] = a2.getDate();
                D[c2 + 16 >> 2] = a2.getMonth();
                D[c2 + 20 >> 2] = a2.getFullYear() - 1900;
                D[c2 + 24 >> 2] = a2.getDay();
                b2 = a2.getFullYear();
                D[c2 + 28 >> 2] = (0 !== b2 % 4 || 0 === b2 % 100 && 0 !== b2 % 400 ? Oc : Nc)[a2.getMonth()] + a2.getDate() - 1 | 0;
                D[c2 + 36 >> 2] = -(60 * a2.getTimezoneOffset());
                b2 = new Date(a2.getFullYear(), 6, 1).getTimezoneOffset();
                var d2 = new Date(a2.getFullYear(), 0, 1).getTimezoneOffset();
                D[c2 + 32 >> 2] = (b2 != d2 && a2.getTimezoneOffset() == Math.min(d2, b2)) | 0;
              },
              j: function(a2, b2, c2, d2, e2, h3, k2, r) {
                e2 = Mc(e2, h3);
                try {
                  if (isNaN(e2)) return 61;
                  var z = U(d2);
                  if (0 !== (b2 & 2) && 0 === (c2 & 2) && 2 !== (z.flags & 2097155)) throw new P2(2);
                  if (1 === (z.flags & 2097155)) throw new P2(2);
                  if (!z.Ga.ab) throw new P2(43);
                  var v3 = z.Ga.ab(z, a2, e2, b2, c2);
                  var E = v3.Cb;
                  D[k2 >> 2] = v3.tb;
                  F[r >> 2] = E;
                  return 0;
                } catch (H) {
                  if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                  return -H.Ja;
                }
              },
              k: function(a2, b2, c2, d2, e2, h3, k2) {
                h3 = Mc(h3, k2);
                try {
                  var r = U(e2);
                  if (c2 & 2) {
                    if (32768 !== (r.node.mode & 61440)) throw new P2(43);
                    if (!(d2 & 2)) {
                      var z = u2.slice(a2, a2 + b2);
                      r.Ga.bb && r.Ga.bb(r, z, h3, b2, d2);
                    }
                  }
                } catch (v3) {
                  if ("undefined" == typeof W || "ErrnoError" !== v3.name) throw v3;
                  return -v3.Ja;
                }
              },
              y: (a2, b2, c2, d2) => {
                var e2 = (/* @__PURE__ */ new Date()).getFullYear(), h3 = new Date(e2, 0, 1).getTimezoneOffset();
                e2 = new Date(e2, 6, 1).getTimezoneOffset();
                F[a2 >> 2] = 60 * Math.max(h3, e2);
                D[b2 >> 2] = Number(h3 != e2);
                b2 = (k2) => {
                  var r = Math.abs(k2);
                  return `UTC${0 <= k2 ? "-" : "+"}${String(Math.floor(r / 60)).padStart(2, "0")}${String(r % 60).padStart(2, "0")}`;
                };
                a2 = b2(h3);
                b2 = b2(e2);
                e2 < h3 ? (q(a2, u2, c2, 17), q(b2, u2, d2, 17)) : (q(a2, u2, d2, 17), q(b2, u2, c2, 17));
              },
              d: () => Date.now(),
              s: () => 2147483648,
              c: () => performance.now(),
              o: (a2) => {
                var b2 = u2.length;
                a2 >>>= 0;
                if (2147483648 < a2) return false;
                for (var c2 = 1; 4 >= c2; c2 *= 2) {
                  var d2 = b2 * (1 + 0.2 / c2);
                  d2 = Math.min(d2, a2 + 100663296);
                  var e2 = Math;
                  d2 = Math.max(a2, d2);
                  a: {
                    e2 = (e2.min.call(e2, 2147483648, d2 + (65536 - d2 % 65536) % 65536) - Ja.buffer.byteLength + 65535) / 65536;
                    try {
                      Ja.grow(e2);
                      Oa();
                      var h3 = 1;
                      break a;
                    } catch (k2) {
                    }
                    h3 = void 0;
                  }
                  if (h3) return true;
                }
                return false;
              },
              A: (a2, b2) => {
                var c2 = 0;
                Rc().forEach((d2, e2) => {
                  var h3 = b2 + c2;
                  e2 = F[a2 + 4 * e2 >> 2] = h3;
                  for (h3 = 0; h3 < d2.length; ++h3) p2[e2++] = d2.charCodeAt(h3);
                  p2[e2] = 0;
                  c2 += d2.length + 1;
                });
                return 0;
              },
              B: (a2, b2) => {
                var c2 = Rc();
                F[a2 >> 2] = c2.length;
                var d2 = 0;
                c2.forEach((e2) => d2 += e2.length + 1);
                F[b2 >> 2] = d2;
                return 0;
              },
              e: function(a2) {
                try {
                  var b2 = U(a2);
                  pa(b2);
                  return 0;
                } catch (c2) {
                  if ("undefined" == typeof W || "ErrnoError" !== c2.name) throw c2;
                  return c2.Ja;
                }
              },
              p: function(a2, b2) {
                try {
                  var c2 = U(a2);
                  p2[b2] = c2.tty ? 2 : R(c2.mode) ? 3 : 40960 === (c2.mode & 61440) ? 7 : 4;
                  La[b2 + 2 >> 1] = 0;
                  J = [0, (I = 0, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                  D[b2 + 8 >> 2] = J[0];
                  D[b2 + 12 >> 2] = J[1];
                  J = [0, (I = 0, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                  D[b2 + 16 >> 2] = J[0];
                  D[b2 + 20 >> 2] = J[1];
                  return 0;
                } catch (d2) {
                  if ("undefined" == typeof W || "ErrnoError" !== d2.name) throw d2;
                  return d2.Ja;
                }
              },
              w: function(a2, b2, c2, d2) {
                try {
                  a: {
                    var e2 = U(a2);
                    a2 = b2;
                    for (var h3, k2 = b2 = 0; k2 < c2; k2++) {
                      var r = F[a2 >> 2], z = F[a2 + 4 >> 2];
                      a2 += 8;
                      var v3 = dc(e2, p2, r, z, h3);
                      if (0 > v3) {
                        var E = -1;
                        break a;
                      }
                      b2 += v3;
                      if (v3 < z) break;
                      "undefined" != typeof h3 && (h3 += v3);
                    }
                    E = b2;
                  }
                  F[d2 >> 2] = E;
                  return 0;
                } catch (H) {
                  if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                  return H.Ja;
                }
              },
              m: function(a2, b2, c2, d2, e2) {
                b2 = Mc(b2, c2);
                try {
                  if (isNaN(b2)) return 61;
                  var h3 = U(a2);
                  cc(h3, b2, d2);
                  J = [h3.position >>> 0, (I = h3.position, 1 <= +Math.abs(I) ? 0 < I ? +Math.floor(I / 4294967296) >>> 0 : ~~+Math.ceil((I - +(~~I >>> 0)) / 4294967296) >>> 0 : 0)];
                  D[e2 >> 2] = J[0];
                  D[e2 + 4 >> 2] = J[1];
                  h3.gb && 0 === b2 && 0 === d2 && (h3.gb = null);
                  return 0;
                } catch (k2) {
                  if ("undefined" == typeof W || "ErrnoError" !== k2.name) throw k2;
                  return k2.Ja;
                }
              },
              D: function(a2) {
                try {
                  var b2 = U(a2);
                  return b2.Ga?.fsync ? b2.Ga.fsync(b2) : 0;
                } catch (c2) {
                  if ("undefined" == typeof W || "ErrnoError" !== c2.name) throw c2;
                  return c2.Ja;
                }
              },
              t: function(a2, b2, c2, d2) {
                try {
                  a: {
                    var e2 = U(a2);
                    a2 = b2;
                    for (var h3, k2 = b2 = 0; k2 < c2; k2++) {
                      var r = F[a2 >> 2], z = F[a2 + 4 >> 2];
                      a2 += 8;
                      var v3 = oa(e2, p2, r, z, h3);
                      if (0 > v3) {
                        var E = -1;
                        break a;
                      }
                      b2 += v3;
                      "undefined" != typeof h3 && (h3 += v3);
                    }
                    E = b2;
                  }
                  F[d2 >> 2] = E;
                  return 0;
                } catch (H) {
                  if ("undefined" == typeof W || "ErrnoError" !== H.name) throw H;
                  return H.Ja;
                }
              }
            }, Z = (function() {
              function a2(c2) {
                Z = c2.exports;
                Ja = Z.I;
                Oa();
                X = Z.K;
                Qa.unshift(Z.J);
                Ua--;
                f2.monitorRunDependencies?.(Ua);
                0 == Ua && (Wa && (c2 = Wa, Wa = null, c2()));
                return Z;
              }
              var b2 = { a: Vc };
              Ua++;
              f2.monitorRunDependencies?.(Ua);
              if (f2.instantiateWasm) try {
                return f2.instantiateWasm(b2, a2);
              } catch (c2) {
                return C(`Module.instantiateWasm callback failed with error: ${c2}`), false;
              }
              Ya || (Ya = Xa("sql-wasm.wasm") ? "sql-wasm.wasm" : f2.locateFile ? f2.locateFile(
                "sql-wasm.wasm",
                B
              ) : B + "sql-wasm.wasm");
              bb(b2, function(c2) {
                a2(c2.instance);
              });
              return {};
            })();
            f2._sqlite3_free = (a2) => (f2._sqlite3_free = Z.L)(a2);
            f2._sqlite3_value_text = (a2) => (f2._sqlite3_value_text = Z.M)(a2);
            f2._sqlite3_prepare_v2 = (a2, b2, c2, d2, e2) => (f2._sqlite3_prepare_v2 = Z.N)(a2, b2, c2, d2, e2);
            f2._sqlite3_step = (a2) => (f2._sqlite3_step = Z.O)(a2);
            f2._sqlite3_reset = (a2) => (f2._sqlite3_reset = Z.P)(a2);
            f2._sqlite3_exec = (a2, b2, c2, d2, e2) => (f2._sqlite3_exec = Z.Q)(a2, b2, c2, d2, e2);
            f2._sqlite3_finalize = (a2) => (f2._sqlite3_finalize = Z.R)(a2);
            f2._sqlite3_column_name = (a2, b2) => (f2._sqlite3_column_name = Z.S)(a2, b2);
            f2._sqlite3_column_text = (a2, b2) => (f2._sqlite3_column_text = Z.T)(a2, b2);
            f2._sqlite3_column_type = (a2, b2) => (f2._sqlite3_column_type = Z.U)(a2, b2);
            f2._sqlite3_errmsg = (a2) => (f2._sqlite3_errmsg = Z.V)(a2);
            f2._sqlite3_clear_bindings = (a2) => (f2._sqlite3_clear_bindings = Z.W)(a2);
            f2._sqlite3_value_blob = (a2) => (f2._sqlite3_value_blob = Z.X)(a2);
            f2._sqlite3_value_bytes = (a2) => (f2._sqlite3_value_bytes = Z.Y)(a2);
            f2._sqlite3_value_double = (a2) => (f2._sqlite3_value_double = Z.Z)(a2);
            f2._sqlite3_value_int = (a2) => (f2._sqlite3_value_int = Z._)(a2);
            f2._sqlite3_value_type = (a2) => (f2._sqlite3_value_type = Z.$)(a2);
            f2._sqlite3_result_blob = (a2, b2, c2, d2) => (f2._sqlite3_result_blob = Z.aa)(a2, b2, c2, d2);
            f2._sqlite3_result_double = (a2, b2) => (f2._sqlite3_result_double = Z.ba)(a2, b2);
            f2._sqlite3_result_error = (a2, b2, c2) => (f2._sqlite3_result_error = Z.ca)(a2, b2, c2);
            f2._sqlite3_result_int = (a2, b2) => (f2._sqlite3_result_int = Z.da)(a2, b2);
            f2._sqlite3_result_int64 = (a2, b2, c2) => (f2._sqlite3_result_int64 = Z.ea)(a2, b2, c2);
            f2._sqlite3_result_null = (a2) => (f2._sqlite3_result_null = Z.fa)(a2);
            f2._sqlite3_result_text = (a2, b2, c2, d2) => (f2._sqlite3_result_text = Z.ga)(a2, b2, c2, d2);
            f2._sqlite3_aggregate_context = (a2, b2) => (f2._sqlite3_aggregate_context = Z.ha)(a2, b2);
            f2._sqlite3_column_count = (a2) => (f2._sqlite3_column_count = Z.ia)(a2);
            f2._sqlite3_data_count = (a2) => (f2._sqlite3_data_count = Z.ja)(a2);
            f2._sqlite3_column_blob = (a2, b2) => (f2._sqlite3_column_blob = Z.ka)(a2, b2);
            f2._sqlite3_column_bytes = (a2, b2) => (f2._sqlite3_column_bytes = Z.la)(a2, b2);
            f2._sqlite3_column_double = (a2, b2) => (f2._sqlite3_column_double = Z.ma)(a2, b2);
            f2._sqlite3_bind_blob = (a2, b2, c2, d2, e2) => (f2._sqlite3_bind_blob = Z.na)(a2, b2, c2, d2, e2);
            f2._sqlite3_bind_double = (a2, b2, c2) => (f2._sqlite3_bind_double = Z.oa)(a2, b2, c2);
            f2._sqlite3_bind_int = (a2, b2, c2) => (f2._sqlite3_bind_int = Z.pa)(a2, b2, c2);
            f2._sqlite3_bind_text = (a2, b2, c2, d2, e2) => (f2._sqlite3_bind_text = Z.qa)(a2, b2, c2, d2, e2);
            f2._sqlite3_bind_parameter_index = (a2, b2) => (f2._sqlite3_bind_parameter_index = Z.ra)(a2, b2);
            f2._sqlite3_sql = (a2) => (f2._sqlite3_sql = Z.sa)(a2);
            f2._sqlite3_normalized_sql = (a2) => (f2._sqlite3_normalized_sql = Z.ta)(a2);
            f2._sqlite3_changes = (a2) => (f2._sqlite3_changes = Z.ua)(a2);
            f2._sqlite3_close_v2 = (a2) => (f2._sqlite3_close_v2 = Z.va)(a2);
            f2._sqlite3_create_function_v2 = (a2, b2, c2, d2, e2, h3, k2, r, z) => (f2._sqlite3_create_function_v2 = Z.wa)(a2, b2, c2, d2, e2, h3, k2, r, z);
            f2._sqlite3_open = (a2, b2) => (f2._sqlite3_open = Z.xa)(a2, b2);
            var ia = f2._malloc = (a2) => (ia = f2._malloc = Z.ya)(a2), fa = f2._free = (a2) => (fa = f2._free = Z.za)(a2);
            f2._RegisterExtensionFunctions = (a2) => (f2._RegisterExtensionFunctions = Z.Aa)(a2);
            var Eb = (a2, b2) => (Eb = Z.Ba)(a2, b2), ua = (a2) => (ua = Z.Ca)(a2), y2 = (a2) => (y2 = Z.Da)(a2), ra = () => (ra = Z.Ea)();
            f2.stackSave = () => ra();
            f2.stackRestore = (a2) => ua(a2);
            f2.stackAlloc = (a2) => y2(a2);
            f2.cwrap = (a2, b2, c2, d2) => {
              var e2 = !c2 || c2.every((h3) => "number" === h3 || "boolean" === h3);
              return "string" !== b2 && e2 && !d2 ? f2["_" + a2] : (...h3) => Sc(a2, b2, c2, h3);
            };
            f2.addFunction = Aa;
            f2.removeFunction = wa;
            f2.UTF8ToString = ta;
            f2.ALLOC_NORMAL = ea;
            f2.allocate = da;
            f2.allocateUTF8OnStack = va;
            var Wc;
            Wa = function Xc() {
              Wc || Yc();
              Wc || (Wa = Xc);
            };
            function Yc() {
              function a2() {
                if (!Wc && (Wc = true, f2.calledRun = true, !Ka)) {
                  f2.noFSInit || ec || (ec = true, f2.stdin = f2.stdin, f2.stdout = f2.stdout, f2.stderr = f2.stderr, f2.stdin ? Fc("stdin", f2.stdin) : Xb("/dev/tty", "/dev/stdin"), f2.stdout ? Fc("stdout", null, f2.stdout) : Xb("/dev/tty", "/dev/stdout"), f2.stderr ? Fc("stderr", null, f2.stderr) : Xb("/dev/tty1", "/dev/stderr"), na("/dev/stdin", 0), na("/dev/stdout", 1), na("/dev/stderr", 1));
                  Jb = false;
                  cb(Qa);
                  f2.onRuntimeInitialized?.();
                  if (f2.postRun) for ("function" == typeof f2.postRun && (f2.postRun = [f2.postRun]); f2.postRun.length; ) {
                    var b2 = f2.postRun.shift();
                    Sa.unshift(b2);
                  }
                  cb(Sa);
                }
              }
              if (!(0 < Ua)) {
                if (f2.preRun) for ("function" == typeof f2.preRun && (f2.preRun = [f2.preRun]); f2.preRun.length; ) Ta();
                cb(Pa);
                0 < Ua || (f2.setStatus ? (f2.setStatus("Running..."), setTimeout(function() {
                  setTimeout(function() {
                    f2.setStatus("");
                  }, 1);
                  a2();
                }, 1)) : a2());
              }
            }
            if (f2.preInit) for ("function" == typeof f2.preInit && (f2.preInit = [f2.preInit]); 0 < f2.preInit.length; ) f2.preInit.pop()();
            Yc();
            return Module;
          });
          return initSqlJsPromise;
        };
        {
          module.exports = initSqlJs2;
          module.exports.default = initSqlJs2;
        }
      })(sqlWasm);
      initSqlJs = sqlWasm.exports;
      UtilsStore = class _UtilsStore {
        static async getDBFromStore(dbName, store) {
          try {
            const retDb = await store.getItem(dbName);
            return Promise.resolve(retDb);
          } catch (err2) {
            return Promise.reject(`GetDBFromStore: ${err2.message}`);
          }
        }
        static async setInitialDBToStore(dbName, store) {
          try {
            const data = null;
            await store.setItem(dbName, data);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(`SetInitialDBToStore: ${err2.message}`);
          }
        }
        static async setDBToStore(mDb, dbName, store) {
          try {
            const data = mDb.export();
            await _UtilsStore.saveDBToStore(dbName, data, store);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(`SetDBToStore: ${err2.message}`);
          }
        }
        static async saveDBToStore(dbName, data, store) {
          try {
            await store.removeItem(dbName);
            await store.setItem(dbName, data);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(`SaveDBToStore: ${err2.message}`);
          }
        }
        static async removeDBFromStore(dbName, store) {
          try {
            await store.removeItem(dbName);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(`RemoveDBFromStore: ${err2.message}`);
          }
        }
        static async isDBInStore(dbName, store) {
          try {
            const retDb = await store.getItem(dbName);
            if (retDb != null && retDb.length > 0) {
              return Promise.resolve(true);
            } else {
              return Promise.resolve(false);
            }
          } catch (err2) {
            return Promise.reject(`IsDBInStore: ${err2}`);
          }
        }
        static async restoreDBFromStore(dbName, prefix, store) {
          const mFileName = `${prefix}-${dbName}`;
          try {
            const isFilePre = await _UtilsStore.isDBInStore(mFileName, store);
            if (isFilePre) {
              const isFile = await _UtilsStore.isDBInStore(dbName, store);
              if (isFile) {
                const retDb = await _UtilsStore.getDBFromStore(mFileName, store);
                await _UtilsStore.saveDBToStore(dbName, retDb, store);
                await _UtilsStore.removeDBFromStore(mFileName, store);
                return Promise.resolve();
              } else {
                return Promise.reject(new Error(`RestoreDBFromStore: ${dbName} does not exist`));
              }
            } else {
              return Promise.reject(new Error(`RestoreDBFromStore: ${mFileName} does not exist`));
            }
          } catch (err2) {
            return Promise.reject(`RestoreDBFromStore: ${err2.message}`);
          }
        }
        static async copyDBToStore(dbName, toDb, store) {
          try {
            const isFile = await _UtilsStore.isDBInStore(dbName, store);
            if (isFile) {
              const retDb = await _UtilsStore.getDBFromStore(dbName, store);
              await _UtilsStore.saveDBToStore(toDb, retDb, store);
              return Promise.resolve();
            } else {
              return Promise.reject(new Error(`CopyDBToStore: ${dbName} does not exist`));
            }
          } catch (err2) {
            return Promise.reject(`CopyDBToStore: ${err2.message}`);
          }
        }
        static async getDBListFromStore(store) {
          try {
            const retDbList = await store.keys();
            return Promise.resolve(retDbList);
          } catch (err2) {
            return Promise.reject(`GetDBListFromStore: ${err2.message}`);
          }
        }
      };
      UtilsDrop = class _UtilsDrop {
        static async getTablesNames(db2) {
          let sql = "SELECT name FROM sqlite_master WHERE ";
          sql += "type='table' AND name NOT LIKE 'sync_table' ";
          sql += "AND name NOT LIKE '_temp_%' ";
          sql += "AND name NOT LIKE 'sqlite_%' ";
          sql += "ORDER BY rootpage DESC;";
          const retArr = [];
          try {
            const retQuery = await UtilsSQLite.queryAll(db2, sql, []);
            for (const query2 of retQuery) {
              retArr.push(query2.name);
            }
            return Promise.resolve(retArr);
          } catch (err2) {
            return Promise.reject(new Error(`GetTablesNames: ${err2.message}`));
          }
        }
        static async getViewsNames(mDb) {
          let sql = "SELECT name FROM sqlite_master WHERE ";
          sql += "type='view' AND name NOT LIKE 'sqlite_%' ";
          sql += "ORDER BY rootpage DESC;";
          const retArr = [];
          try {
            const retQuery = await UtilsSQLite.queryAll(mDb, sql, []);
            for (const query2 of retQuery) {
              retArr.push(query2.name);
            }
            return Promise.resolve(retArr);
          } catch (err2) {
            return Promise.reject(new Error(`getViewsNames: ${err2.message}`));
          }
        }
        static async dropElements(db2, type) {
          let msg = "";
          let stmt1 = `AND name NOT LIKE ('sqlite_%')`;
          switch (type) {
            case "index":
              msg = "DropIndexes";
              break;
            case "trigger":
              msg = "DropTriggers";
              break;
            case "table":
              msg = "DropTables";
              stmt1 += ` AND name NOT IN ('sync_table')`;
              break;
            case "view":
              msg = "DropViews";
              break;
            default:
              return Promise.reject(new Error(`DropElements: ${type} not found`));
          }
          let stmt = "SELECT name FROM sqlite_master WHERE ";
          stmt += `type = '${type}' ${stmt1};`;
          try {
            const elements = await UtilsSQLite.queryAll(db2, stmt, []);
            if (elements.length > 0) {
              const upType = type.toUpperCase();
              const statements = [];
              for (const elem of elements) {
                let stmt2 = `DROP ${upType} IF EXISTS `;
                stmt2 += `${elem.name};`;
                statements.push(stmt2);
              }
              for (const stmt2 of statements) {
                const lastId = await UtilsSQLite.run(db2, stmt2, [], false, "no");
                if (lastId < 0) {
                  return Promise.reject(new Error(`DropElements: ${msg}: lastId < 0`));
                }
              }
            }
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(new Error(`DropElements: ${msg}: ${err2.message}`));
          }
        }
        static async dropAll(db2) {
          try {
            await _UtilsDrop.dropElements(db2, "table");
            await _UtilsDrop.dropElements(db2, "index");
            await _UtilsDrop.dropElements(db2, "trigger");
            await _UtilsDrop.dropElements(db2, "view");
            await UtilsSQLite.run(db2, "VACUUM;", [], false, "no");
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(new Error(`DropAll: ${err2.message}`));
          }
        }
        static async dropTempTables(db2, alterTables) {
          const tempTables = Object.keys(alterTables);
          const statements = [];
          for (const tTable of tempTables) {
            let stmt = "DROP TABLE IF EXISTS ";
            stmt += `_temp_${tTable};`;
            statements.push(stmt);
          }
          try {
            const changes = await UtilsSQLite.execute(db2, statements.join("\n"), false);
            if (changes < 0) {
              return Promise.reject(new Error("DropTempTables: changes < 0"));
            }
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(new Error(`DropTempTables: ${err2.message}`));
          }
        }
      };
      UtilsJSON = class _UtilsJSON {
        static async isJsonSQLite(obj) {
          const keyFirstLevel = [
            "database",
            "version",
            "overwrite",
            "encrypted",
            "mode",
            "tables",
            "views"
          ];
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keyFirstLevel.indexOf(key) === -1)
              return false;
            if (key === "database" && typeof obj[key] != "string")
              return false;
            if (key === "version" && typeof obj[key] != "number")
              return false;
            if (key === "overwrite" && typeof obj[key] != "boolean")
              return false;
            if (key === "encrypted" && typeof obj[key] != "boolean")
              return false;
            if (key === "mode" && typeof obj[key] != "string")
              return false;
            if (key === "tables" && typeof obj[key] != "object")
              return false;
            if (key === "tables") {
              for (const oKey of obj[key]) {
                const retTable = await _UtilsJSON.isTable(oKey);
                if (!retTable)
                  return false;
              }
            }
            if (key === "views" && typeof obj[key] != "object")
              return false;
            if (key === "views") {
              for (const oKey of obj[key]) {
                const retView = await _UtilsJSON.isView(oKey);
                if (!retView)
                  return false;
              }
            }
          }
          return true;
        }
        static async isTable(obj) {
          const keyTableLevel = [
            "name",
            "schema",
            "indexes",
            "triggers",
            "values"
          ];
          let nbColumn = 0;
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keyTableLevel.indexOf(key) === -1)
              return false;
            if (key === "name" && typeof obj[key] != "string")
              return false;
            if (key === "schema" && typeof obj[key] != "object")
              return false;
            if (key === "indexes" && typeof obj[key] != "object")
              return false;
            if (key === "triggers" && typeof obj[key] != "object")
              return false;
            if (key === "values" && typeof obj[key] != "object")
              return false;
            if (key === "schema") {
              obj["schema"].forEach((element) => {
                if (element.column) {
                  nbColumn++;
                }
              });
              for (let i = 0; i < nbColumn; i++) {
                const retSchema = await _UtilsJSON.isSchema(obj[key][i]);
                if (!retSchema)
                  return false;
              }
            }
            if (key === "indexes") {
              for (const oKey of obj[key]) {
                const retIndexes = await _UtilsJSON.isIndexes(oKey);
                if (!retIndexes)
                  return false;
              }
            }
            if (key === "triggers") {
              for (const oKey of obj[key]) {
                const retTriggers = await _UtilsJSON.isTriggers(oKey);
                if (!retTriggers)
                  return false;
              }
            }
            if (key === "values") {
              if (nbColumn > 0) {
                for (const oKey of obj[key]) {
                  if (typeof oKey != "object" || oKey.length != nbColumn)
                    return false;
                }
              }
            }
          }
          return true;
        }
        static async isSchema(obj) {
          const keySchemaLevel = [
            "column",
            "value",
            "foreignkey",
            "primarykey",
            "constraint"
          ];
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keySchemaLevel.indexOf(key) === -1)
              return false;
            if (key === "column" && typeof obj[key] != "string")
              return false;
            if (key === "value" && typeof obj[key] != "string")
              return false;
            if (key === "foreignkey" && typeof obj[key] != "string")
              return false;
            if (key === "primarykey" && typeof obj[key] != "string")
              return false;
            if (key === "constraint" && typeof obj[key] != "string")
              return false;
          }
          return true;
        }
        static async isIndexes(obj) {
          const keyIndexesLevel = ["name", "value", "mode"];
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keyIndexesLevel.indexOf(key) === -1)
              return false;
            if (key === "name" && typeof obj[key] != "string")
              return false;
            if (key === "value" && typeof obj[key] != "string")
              return false;
            if (key === "mode" && (typeof obj[key] != "string" || obj[key].toUpperCase() != "UNIQUE"))
              return false;
          }
          return true;
        }
        static async isTriggers(obj) {
          const keyTriggersLevel = [
            "name",
            "timeevent",
            "condition",
            "logic"
          ];
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keyTriggersLevel.indexOf(key) === -1)
              return false;
            if (key === "name" && typeof obj[key] != "string")
              return false;
            if (key === "timeevent" && typeof obj[key] != "string")
              return false;
            if (key === "condition" && typeof obj[key] != "string")
              return false;
            if (key === "logic" && typeof obj[key] != "string")
              return false;
          }
          return true;
        }
        static async isView(obj) {
          const keyViewLevel = ["name", "value"];
          if (obj == null || Object.keys(obj).length === 0 && obj.constructor === Object)
            return false;
          for (const key of Object.keys(obj)) {
            if (keyViewLevel.indexOf(key) === -1)
              return false;
            if (key === "name" && typeof obj[key] != "string")
              return false;
            if (key === "value" && typeof obj[key] != "string")
              return false;
          }
          return true;
        }
        static async checkSchemaValidity(schema) {
          for (let i = 0; i < schema.length; i++) {
            const sch = {};
            const keys = Object.keys(schema[i]);
            if (keys.includes("column")) {
              sch.column = schema[i].column;
            }
            if (keys.includes("value")) {
              sch.value = schema[i].value;
            }
            if (keys.includes("foreignkey")) {
              sch.foreignkey = schema[i].foreignkey;
            }
            if (keys.includes("constraint")) {
              sch.constraint = schema[i].constraint;
            }
            const isValid = await _UtilsJSON.isSchema(sch);
            if (!isValid) {
              return Promise.reject(new Error(`CheckSchemaValidity: schema[${i}] not valid`));
            }
          }
          return Promise.resolve();
        }
        static async checkIndexesValidity(indexes) {
          for (let i = 0; i < indexes.length; i++) {
            const index = {};
            const keys = Object.keys(indexes[i]);
            if (keys.includes("value")) {
              index.value = indexes[i].value;
            }
            if (keys.includes("name")) {
              index.name = indexes[i].name;
            }
            if (keys.includes("mode")) {
              index.mode = indexes[i].mode;
            }
            const isValid = await _UtilsJSON.isIndexes(index);
            if (!isValid) {
              return Promise.reject(new Error(`CheckIndexesValidity: indexes[${i}] not valid`));
            }
          }
          return Promise.resolve();
        }
        static async checkTriggersValidity(triggers) {
          for (let i = 0; i < triggers.length; i++) {
            const trigger = {};
            const keys = Object.keys(triggers[i]);
            if (keys.includes("logic")) {
              trigger.logic = triggers[i].logic;
            }
            if (keys.includes("name")) {
              trigger.name = triggers[i].name;
            }
            if (keys.includes("timeevent")) {
              trigger.timeevent = triggers[i].timeevent;
            }
            if (keys.includes("condition")) {
              trigger.condition = triggers[i].condition;
            }
            const isValid = await _UtilsJSON.isTriggers(trigger);
            if (!isValid) {
              return Promise.reject(new Error(`CheckTriggersValidity: triggers[${i}] not valid`));
            }
          }
          return Promise.resolve();
        }
        static async checkViewsValidity(views) {
          for (let i = 0; i < views.length; i++) {
            const view = {};
            const keys = Object.keys(views[i]);
            if (keys.includes("value")) {
              view.value = views[i].value;
            }
            if (keys.includes("name")) {
              view.name = views[i].name;
            }
            const isValid = await _UtilsJSON.isView(view);
            if (!isValid) {
              return Promise.reject(new Error(`CheckViewsValidity: views[${i}] not valid`));
            }
          }
          return Promise.resolve();
        }
        static async getTableColumnNamesTypes(db2, tableName) {
          let resQuery = [];
          const retNames = [];
          const retTypes = [];
          const query2 = `PRAGMA table_info('${tableName}');`;
          try {
            resQuery = await UtilsSQLite.queryAll(db2, query2, []);
            if (resQuery.length > 0) {
              for (const query3 of resQuery) {
                retNames.push(query3.name);
                retTypes.push(query3.type);
              }
            }
            return Promise.resolve({ names: retNames, types: retTypes });
          } catch (err2) {
            return Promise.reject(new Error(`GetTableColumnNamesTypes: ${err2.message}`));
          }
        }
        static async getValues(db2, query2, tableName) {
          const values = [];
          try {
            const tableNamesTypes = await _UtilsJSON.getTableColumnNamesTypes(db2, tableName);
            let rowNames = [];
            if (Object.keys(tableNamesTypes).includes("names")) {
              rowNames = tableNamesTypes.names;
            } else {
              return Promise.reject(new Error(`GetValues: Table ${tableName} no names`));
            }
            const retValues = await UtilsSQLite.queryAll(db2, query2, []);
            for (const rValue of retValues) {
              const row = [];
              for (const rName of rowNames) {
                if (Object.keys(rValue).includes(rName)) {
                  row.push(rValue[rName]);
                } else {
                  row.push(null);
                }
              }
              values.push(row);
            }
            return Promise.resolve(values);
          } catch (err2) {
            return Promise.reject(new Error(`GetValues: ${err2.message}`));
          }
        }
      };
      UtilsSQLStatement = class _UtilsSQLStatement {
        static extractTableName(statement) {
          const pattern = /(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+([^\s]+)/i;
          const match = statement.match(pattern);
          if (match && match[1]) {
            const tableName = match[1];
            return tableName;
          }
          return null;
        }
        static extractWhereClause(statement) {
          const pattern = /WHERE(.+?)(?:ORDER\s+BY|LIMIT|$)/i;
          const match = statement.match(pattern);
          if (match && match[1]) {
            const whereClause = match[1].trim();
            return whereClause;
          }
          return null;
        }
        static addPrefixToWhereClause(whereClause, colNames, refNames, prefix) {
          let columnValuePairs;
          if (whereClause.includes("AND")) {
            const subSequenceArray = whereClause.split("AND");
            columnValuePairs = subSequenceArray.map((pair) => pair.trim());
          } else {
            columnValuePairs = [whereClause];
          }
          const modifiedPairs = columnValuePairs.map((pair) => {
            const match = pair.match(/(\w+)\s*(=|<|<=|<>|>|>=|IN|BETWEEN|LIKE)\s*(.+)/);
            if (!match) {
              return pair;
            }
            const column = match[1].trim();
            const operator = match[2].trim();
            let value = match[3].trim();
            let newColumn = column;
            const index = _UtilsSQLStatement.findIndexOfStringInArray(column, refNames);
            if (index !== -1) {
              newColumn = _UtilsSQLStatement.getStringAtIndex(colNames, index);
            }
            const modifiedColumn = `${prefix}${newColumn}`;
            const ret = `${modifiedColumn} ${operator} ${value}`;
            return ret;
          });
          return modifiedPairs.join(" AND ");
        }
        static findIndexOfStringInArray(target, array) {
          return array.indexOf(target);
        }
        static getStringAtIndex(array, index) {
          if (index >= 0 && index < array.length) {
            return array[index];
          } else {
            return void 0;
          }
        }
        static extractForeignKeyInfo(sqlStatement) {
          const foreignKeyPattern = /\bFOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)\s+(ON\s+DELETE\s+(RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT|NO\s+ACTION))?/;
          const matches = sqlStatement.match(foreignKeyPattern);
          if (matches) {
            const foreignKeyInfo = {
              forKeys: matches[1].split(",").map((key) => key.trim()),
              tableName: matches[2],
              refKeys: matches[3].split(",").map((key) => key.trim()),
              action: matches[5] ? matches[5] : "NO ACTION"
            };
            return foreignKeyInfo;
          } else {
            throw new Error("extractForeignKeyInfo: No FOREIGN KEY found");
          }
        }
        static extractColumnNames(whereClause) {
          const keywords = /* @__PURE__ */ new Set([
            "AND",
            "OR",
            "IN",
            "VALUES",
            "LIKE",
            "BETWEEN",
            "NOT"
          ]);
          const regex = /\b[a-zA-Z]\w*\b(?=\s*(?:<=?|>=?|<>?|=|AND|OR|BETWEEN|NOT|IN|LIKE))|\b[a-zA-Z]\w*\b\s+BETWEEN\s+'[^']+'\s+AND\s+'[^']+'|\(([^)]+)\)\s+IN\s+\(?\s*VALUES\s*\(/g;
          let match;
          const columns = [];
          while ((match = regex.exec(whereClause)) !== null) {
            const columnList = match[1];
            if (columnList) {
              const columnNamesArray = columnList.split(",");
              for (const columnName of columnNamesArray) {
                columns.push(columnName.trim());
              }
            } else {
              const matchedText = match[0];
              if (!keywords.has(matchedText.trim().toUpperCase())) {
                columns.push(matchedText.trim());
              }
            }
          }
          return columns;
        }
        static flattenMultilineString(input) {
          const lines = input.split(/\r?\n/);
          return lines.join(" ");
        }
        static getStmtAndRetColNames(sqlStmt, retMode) {
          const retWord = "RETURNING";
          const retStmtNames = { stmt: sqlStmt, names: "" };
          const retWordIndex = sqlStmt.toUpperCase().indexOf(retWord);
          if (retWordIndex !== -1) {
            const prefix = sqlStmt.substring(0, retWordIndex);
            retStmtNames.stmt = `${prefix};`;
            if (retMode.substring(0, 2) === "wA") {
              const suffix = sqlStmt.substring(retWordIndex + retWord.length);
              const names = suffix.trim();
              if (names.endsWith(";")) {
                retStmtNames.names = names.substring(0, names.length - 1);
              } else {
                retStmtNames.names = names;
              }
            }
          }
          return retStmtNames;
        }
        static extractCombinedPrimaryKey(whereClause) {
          const pattern = /WHERE\s*\((.+?)\)\s*(?:=|IN)\s*\((.+?)\)/g;
          const regex = new RegExp(pattern);
          const matches = whereClause.matchAll(regex);
          const primaryKeySets = [];
          for (const match of matches) {
            const keysString = match[1].trim();
            const keys = keysString.split(",").map((key) => key.trim());
            primaryKeySets.push(keys);
          }
          return primaryKeySets.length === 0 ? null : primaryKeySets;
        }
        static getWhereStmtForCombinedPK(whStmt, withRefs, colNames, keys) {
          let retWhere = whStmt;
          for (const grpKeys of keys) {
            const repKeys = grpKeys.join(",") === withRefs.join(",") ? colNames : withRefs;
            for (const [index, key] of grpKeys.entries()) {
              retWhere = _UtilsSQLStatement.replaceAllString(retWhere, key, repKeys[index]);
            }
          }
          return retWhere;
        }
        static replaceAllString(originalStr, searchStr, replaceStr) {
          return originalStr.split(searchStr).join(replaceStr);
        }
        static indicesOf(str, searchStr, fromIndex = 0) {
          const indices = [];
          let currentIndex = str.indexOf(searchStr, fromIndex);
          while (currentIndex !== -1) {
            indices.push(currentIndex);
            currentIndex = str.indexOf(searchStr, currentIndex + 1);
          }
          return indices;
        }
        static getWhereStmtForNonCombinedPK(whStmt, withRefs, colNames) {
          let whereStmt = "";
          let stmt = whStmt.substring(6);
          for (let idx = 0; idx < withRefs.length; idx++) {
            let colType = "withRefsNames";
            let idxs = _UtilsSQLStatement.indicesOf(stmt, withRefs[idx]);
            if (idxs.length === 0) {
              idxs = _UtilsSQLStatement.indicesOf(stmt, colNames[idx]);
              colType = "colNames";
            }
            if (idxs.length > 0) {
              let valStr = "";
              const indicesEqual = _UtilsSQLStatement.indicesOf(stmt, "=", idxs[0]);
              if (indicesEqual.length > 0) {
                const indicesAnd = _UtilsSQLStatement.indicesOf(stmt, "AND", indicesEqual[0]);
                if (indicesAnd.length > 0) {
                  valStr = stmt.substring(indicesEqual[0] + 1, indicesAnd[0] - 1);
                  stmt = stmt.substring(indicesAnd[0] + 3);
                } else {
                  valStr = stmt.substring(indicesEqual[0] + 1);
                }
                if (idx > 0) {
                  whereStmt += " AND ";
                }
                if (colType === "withRefsNames") {
                  whereStmt += colNames[idx] + " = " + valStr;
                } else {
                  whereStmt += withRefs[idx] + " = " + valStr;
                }
              }
            }
          }
          whereStmt = "WHERE " + whereStmt;
          return whereStmt;
        }
        static updateWhere(whStmt, withRefs, colNames) {
          let whereStmt = "";
          if (whStmt.length <= 0) {
            return whereStmt;
          }
          if (whStmt.toUpperCase().substring(0, 5) !== "WHERE") {
            return whereStmt;
          }
          if (withRefs.length === colNames.length) {
            const keys = _UtilsSQLStatement.extractCombinedPrimaryKey(whStmt);
            if (keys) {
              whereStmt = _UtilsSQLStatement.getWhereStmtForCombinedPK(whStmt, withRefs, colNames, keys);
            } else {
              whereStmt = _UtilsSQLStatement.getWhereStmtForNonCombinedPK(whStmt, withRefs, colNames);
            }
          }
          return whereStmt;
        }
      };
      UtilsSQLStatement.replaceString = (originalStr, searchStr, replaceStr) => {
        const range = originalStr.indexOf(searchStr);
        if (range !== -1) {
          const modifiedStr = originalStr.substring(0, range) + replaceStr + originalStr.substring(range + searchStr.length);
          return modifiedStr;
        }
        return originalStr;
      };
      UtilsDeleteError = class _UtilsDeleteError {
        static findReferencesAndUpdate(message) {
          return new _UtilsDeleteError(message);
        }
        static getRefs(message) {
          return new _UtilsDeleteError(message);
        }
        static getReferences(message) {
          return new _UtilsDeleteError(message);
        }
        static searchForRelatedItems(message) {
          return new _UtilsDeleteError(message);
        }
        static upDateWhereForDefault(message) {
          return new _UtilsDeleteError(message);
        }
        static upDateWhereForRestrict(message) {
          return new _UtilsDeleteError(message);
        }
        static upDateWhereForCascade(message) {
          return new _UtilsDeleteError(message);
        }
        static executeUpdateForDelete(message) {
          return new _UtilsDeleteError(message);
        }
        constructor(message) {
          this.message = message;
        }
      };
      UtilsDelete = class _UtilsDelete {
        static async findReferencesAndUpdate(mDB, tableName, whereStmt, initColNames, values) {
          try {
            let retBool = true;
            const result = await _UtilsDelete.getReferences(mDB, tableName);
            const references = result.retRefs;
            const tableNameWithRefs = result.tableWithRefs;
            if (references.length <= 0) {
              return retBool;
            }
            if (tableName === tableNameWithRefs) {
              return retBool;
            }
            for (const ref of references) {
              const foreignKeyInfo = UtilsSQLStatement.extractForeignKeyInfo(ref);
              const refTable = foreignKeyInfo.tableName;
              if (refTable === "" || refTable !== tableName) {
                continue;
              }
              const withRefsNames = foreignKeyInfo.forKeys;
              const colNames = foreignKeyInfo.refKeys;
              if (colNames.length !== withRefsNames.length) {
                const msg = "findReferencesAndUpdate: mismatch length";
                throw UtilsDeleteError.findReferencesAndUpdate(msg);
              }
              const action = foreignKeyInfo.action;
              if (action === "NO_ACTION") {
                continue;
              }
              let updTableName = tableNameWithRefs;
              let updColNames = withRefsNames;
              let results = {
                uWhereStmt: "",
                setStmt: ""
              };
              if (!_UtilsDelete.checkValuesMatch(withRefsNames, initColNames)) {
                const result2 = await _UtilsDelete.searchForRelatedItems(mDB, updTableName, tableName, whereStmt, withRefsNames, colNames, values);
                if (result2.relatedItems.length === 0 && result2.key.length <= 0) {
                  continue;
                }
                if (updTableName !== tableName) {
                  switch (action) {
                    case "RESTRICT":
                      results = await _UtilsDelete.upDateWhereForRestrict(result2);
                      break;
                    case "CASCADE":
                      results = await _UtilsDelete.upDateWhereForCascade(result2);
                      break;
                    default:
                      results = await _UtilsDelete.upDateWhereForDefault(withRefsNames, result2);
                      break;
                  }
                }
              } else {
                throw UtilsDeleteError.findReferencesAndUpdate("Not implemented. Please transfer your example to the maintener");
              }
              if (results.setStmt.length > 0 && results.uWhereStmt.length > 0) {
                _UtilsDelete.executeUpdateForDelete(mDB, updTableName, results.uWhereStmt, results.setStmt, updColNames, values);
              }
            }
            return retBool;
          } catch (error) {
            const msg = error.message ? error.message : error;
            if (error instanceof UtilsDeleteError) {
              throw UtilsDeleteError.findReferencesAndUpdate(msg);
            } else {
              throw error;
            }
          }
        }
        static async getReferences(db2, tableName) {
          const sqlStmt = "SELECT sql FROM sqlite_master WHERE sql LIKE('%FOREIGN KEY%') AND sql LIKE('%REFERENCES%') AND sql LIKE('%" + tableName + "%') AND sql LIKE('%ON DELETE%');";
          try {
            const res = await UtilsSQLite.queryAll(db2, sqlStmt, []);
            let retRefs = [];
            let tableWithRefs = "";
            if (res.length > 0) {
              let result = _UtilsDelete.getRefs(res[0].sql);
              retRefs = result.foreignKeys;
              tableWithRefs = result.tableName;
            }
            return Promise.resolve({ tableWithRefs, retRefs });
          } catch (err2) {
            const error = err2.message ? err2.message : err2;
            const msg = `getReferences: ${error}`;
            throw UtilsDeleteError.getReferences(msg);
          }
        }
        static getRefs(sqlStatement) {
          let tableName = "";
          const foreignKeys = [];
          const statement = UtilsSQLStatement.flattenMultilineString(sqlStatement);
          try {
            const tableNamePattern = /CREATE\s+TABLE\s+(\w+)\s+\(/;
            const tableNameMatch = statement.match(tableNamePattern);
            if (tableNameMatch) {
              tableName = tableNameMatch[1];
            }
            const foreignKeyPattern = /FOREIGN\s+KEY\s+\([^)]+\)\s+REFERENCES\s+(\w+)\s*\([^)]+\)\s+ON\s+DELETE\s+(CASCADE|RESTRICT|SET\s+DEFAULT|SET\s+NULL|NO\s+ACTION)/g;
            const foreignKeyMatches = statement.matchAll(foreignKeyPattern);
            for (const foreignKeyMatch of foreignKeyMatches) {
              const foreignKey = foreignKeyMatch[0];
              foreignKeys.push(foreignKey);
            }
          } catch (error) {
            const msg = `getRefs: Error creating regular expression: ${error}`;
            throw UtilsDeleteError.getRefs(msg);
          }
          return { tableName, foreignKeys };
        }
        static async getReferencedTableName(refValue) {
          var tableName = "";
          if (refValue.length > 0) {
            const arr = refValue.split(new RegExp("REFERENCES", "i"));
            if (arr.length === 2) {
              const oPar = arr[1].indexOf("(");
              tableName = arr[1].substring(0, oPar).trim();
            }
          }
          return tableName;
        }
        static async searchForRelatedItems(mDB, updTableName, tableName, whStmt, withRefsNames, colNames, values) {
          const relatedItems = [];
          let key = "";
          const t1Names = withRefsNames.map((name) => `t1.${name}`);
          const t2Names = colNames.map((name) => `t2.${name}`);
          try {
            let whereClause = UtilsSQLStatement.addPrefixToWhereClause(whStmt, colNames, withRefsNames, "t2.");
            if (whereClause.endsWith(";")) {
              whereClause = whereClause.slice(0, -1);
            }
            const resultString = t1Names.map((t1, index) => `${t1} = ${t2Names[index]}`).join(" AND ");
            const sql = `SELECT t1.rowid FROM ${updTableName} t1 JOIN ${tableName} t2 ON ${resultString} WHERE ${whereClause} AND t1.sql_deleted = 0;`;
            const vals = await UtilsSQLite.queryAll(mDB, sql, values);
            if (vals.length > 0) {
              key = Object.keys(vals[0])[0];
              relatedItems.push(...vals);
            }
            return { key, relatedItems };
          } catch (error) {
            const msg = error.message ? error.message : error;
            throw UtilsDeleteError.searchForRelatedItems(msg);
          }
        }
        static async upDateWhereForDefault(withRefsNames, results) {
          let setStmt = "";
          let uWhereStmt = "";
          try {
            const key = results.key;
            const cols = [];
            for (const relItem of results.relatedItems) {
              const mVal = relItem[key];
              if (mVal !== void 0) {
                cols.push(mVal);
              }
            }
            for (const name of withRefsNames) {
              setStmt += `${name} = NULL, `;
            }
            setStmt += "sql_deleted = 0";
            uWhereStmt = `WHERE ${key} IN (`;
            for (const col of cols) {
              uWhereStmt += `${col},`;
            }
            if (uWhereStmt.endsWith(",")) {
              uWhereStmt = uWhereStmt.slice(0, -1);
            }
            uWhereStmt += ");";
          } catch (error) {
            const msg = error.message ? error.message : error;
            throw UtilsDeleteError.upDateWhereForDefault(msg);
          }
          return { setStmt, uWhereStmt };
        }
        static async upDateWhereForRestrict(results) {
          try {
            const setStmt = "";
            const uWhereStmt = "";
            if (results.relatedItems.length > 0) {
              const msg = "Restrict mode related items exist, please delete them first";
              throw UtilsDeleteError.upDateWhereForRestrict(msg);
            }
            return { setStmt, uWhereStmt };
          } catch (error) {
            const msg = error.message ? error.message : error;
            throw UtilsDeleteError.upDateWhereForRestrict(msg);
          }
        }
        static async upDateWhereForCascade(results) {
          let setStmt = "";
          let uWhereStmt = "";
          try {
            const key = results.key;
            const cols = [];
            for (const relItem of results.relatedItems) {
              const mVal = relItem[key];
              if (mVal !== void 0) {
                cols.push(mVal);
              }
            }
            setStmt += "sql_deleted = 1";
            uWhereStmt = `WHERE ${key} IN (`;
            for (const col of cols) {
              uWhereStmt += `${col},`;
            }
            if (uWhereStmt.endsWith(",")) {
              uWhereStmt = uWhereStmt.slice(0, -1);
            }
            uWhereStmt += ");";
          } catch (error) {
            const msg = error.message ? error.message : error;
            throw UtilsDeleteError.upDateWhereForCascade(msg);
          }
          return { setStmt, uWhereStmt };
        }
        static executeUpdateForDelete(mDB, tableName, whereStmt, setStmt, colNames, values) {
          try {
            let lastId = -1;
            const stmt = `UPDATE ${tableName} SET ${setStmt} ${whereStmt}`;
            const selValues = [];
            if (values.length > 0) {
              const arrVal = whereStmt.split("?");
              if (arrVal[arrVal.length - 1] === ";") {
                arrVal.pop();
              }
              for (let jdx = 0; jdx < arrVal.length; jdx++) {
                for (const updVal of colNames) {
                  const indices = UtilsSQLStatement.indicesOf(arrVal[jdx], updVal);
                  if (indices.length > 0) {
                    selValues.push(values[jdx]);
                  }
                }
              }
            }
            const retObj = UtilsSQLite.run(mDB, stmt, selValues, false, "no");
            lastId = retObj["lastId"];
            if (lastId === -1) {
              const msg = `UPDATE sql_deleted failed for table: ${tableName}`;
              throw UtilsDeleteError.executeUpdateForDelete(msg);
            }
          } catch (error) {
            const msg = error.message ? error.message : error;
            throw UtilsDeleteError.executeUpdateForDelete(msg);
          }
        }
        static getCurrentTimeAsInteger() {
          const currentTime = Math.floor(Date.now() / 1e3);
          return currentTime;
        }
        static checkValuesMatch(array1, array2) {
          for (const value of array1) {
            if (!array2.includes(value)) {
              return false;
            }
          }
          return true;
        }
      };
      UtilsSQLite = class _UtilsSQLite {
        static async beginTransaction(db2, isOpen) {
          const msg = "BeginTransaction: ";
          if (!isOpen) {
            return Promise.reject(new Error(`${msg}database not opened`));
          }
          try {
            db2.exec("BEGIN TRANSACTION");
            return Promise.resolve();
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`${msg}${msge}`));
          }
        }
        static async rollbackTransaction(db2, isOpen) {
          const msg = "RollbackTransaction: ";
          if (!isOpen) {
            return Promise.reject(new Error(`${msg}database not opened`));
          }
          try {
            db2.exec("ROLLBACK TRANSACTION");
            return Promise.resolve();
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`${msg}${msge}`));
          }
        }
        static commitTransaction(db2, isOpen) {
          const msg = "CommitTransaction: ";
          if (!isOpen) {
            return Promise.reject(new Error(`${msg}database not opened`));
          }
          const sql = "COMMIT TRANSACTION";
          try {
            db2.exec(sql);
            return Promise.resolve();
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`${msg}${msge}`));
          }
        }
        static async dbChanges(db2) {
          const SELECT_CHANGE = "SELECT total_changes()";
          let changes = 0;
          try {
            const res = db2.exec(SELECT_CHANGE);
            changes = res[0].values[0][0];
            return Promise.resolve(changes);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`DbChanges failed: ${msg}`));
          }
        }
        static async getLastId(db2) {
          const SELECT_LAST_ID = "SELECT last_insert_rowid()";
          let lastId = -1;
          try {
            const res = db2.exec(SELECT_LAST_ID);
            lastId = res[0].values[0][0];
            return Promise.resolve(lastId);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`GetLastId failed: ${msg}`));
          }
        }
        static async setForeignKeyConstraintsEnabled(db2, toggle) {
          let stmt = "PRAGMA foreign_keys=OFF";
          if (toggle) {
            stmt = "PRAGMA foreign_keys=ON";
          }
          try {
            db2.run(stmt);
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`SetForeignKey: ${msg}`));
          }
        }
        static async getVersion(db2) {
          let version2 = 0;
          try {
            const res = db2.exec("PRAGMA user_version;");
            console.log(`#### getVersion new res: ${JSON.stringify(res)}`);
            if (res && res.length > 0 && res[0].values && res[0].values.length > 0 && res[0].values[0].length > 0) {
              version2 = res[0].values[0][0];
            } else {
              const msg = "Cannot return the version from the database";
              return Promise.reject(new Error(`GetVersion: ${msg}`));
            }
            return Promise.resolve(version2);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`GetVersion: ${msg}`));
          }
        }
        static async setVersion(db2, version2) {
          try {
            db2.exec(`PRAGMA user_version = ${version2}`);
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`SetVersion: ${msg}`));
          }
        }
        static async execute(db2, sql, fromJson) {
          try {
            var sqlStmt = sql;
            if (!fromJson && sql.toLowerCase().includes("DELETE FROM".toLowerCase())) {
              sqlStmt = sql.replace(/\n/g, "");
              let sqlStmts = sqlStmt.split(";");
              var resArr = [];
              for (const stmt of sqlStmts) {
                const trimStmt = stmt.trim().substring(0, 11).toUpperCase();
                if (trimStmt === "DELETE FROM" && stmt.toLowerCase().includes("WHERE".toLowerCase())) {
                  const whereStmt = stmt.trim();
                  const rStmt = await _UtilsSQLite.deleteSQL(db2, whereStmt, []);
                  resArr.push(rStmt);
                } else {
                  resArr.push(stmt);
                }
              }
              sqlStmt = resArr.join(";");
            }
            db2.exec(sqlStmt);
            const changes = await _UtilsSQLite.dbChanges(db2);
            return Promise.resolve(changes);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`Execute: ${msg}`));
          }
        }
        static async executeSet(db2, set, fromJson, returnMode) {
          const retValues = [];
          let lastId = -1;
          let retObj = {};
          for (let i = 0; i < set.length; i++) {
            const statement = "statement" in set[i] ? set[i].statement : null;
            const values = "values" in set[i] && set[i].values.length > 0 ? set[i].values : [];
            if (statement == null) {
              let msg = "ExecuteSet: Error No statement";
              msg += ` for index ${i}`;
              return Promise.reject(new Error(msg));
            }
            try {
              if (Array.isArray(values[0])) {
                for (const val of values) {
                  const mVal = await _UtilsSQLite.replaceUndefinedByNull(val);
                  retObj = await _UtilsSQLite.run(db2, statement, mVal, fromJson, returnMode);
                  lastId = retObj["lastId"];
                  if (Object.keys(retObj).includes("values") && retObj["values"].length > 0) {
                    retValues.push(retObj["values"]);
                  }
                }
              } else {
                const mVal = await _UtilsSQLite.replaceUndefinedByNull(values);
                retObj = await _UtilsSQLite.run(db2, statement, mVal, fromJson, returnMode);
                lastId = retObj["lastId"];
                if (Object.keys(retObj).includes("values") && retObj["values"].length > 0) {
                  retValues.push(retObj["values"]);
                }
              }
            } catch (err2) {
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`ExecuteSet: ${msg}`));
            }
          }
          retObj["lastId"] = lastId;
          retObj["values"] = returnMode === "all" ? retValues : returnMode === "one" ? retValues[0] : [];
          return Promise.resolve(retObj);
        }
        static async queryAll(db2, sql, values) {
          try {
            let retArr = [];
            if (values != null && values.length > 0) {
              retArr = db2.exec(sql, values);
            } else {
              retArr = db2.exec(sql);
            }
            if (retArr.length == 0)
              return Promise.resolve([]);
            const result = retArr[0].values.map((entry) => {
              const obj = {};
              retArr[0].columns.forEach((column, index) => {
                obj[column] = entry[index];
              });
              return obj;
            });
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`queryAll: ${msg}`));
          }
        }
        static async run(db2, statement, values, fromJson, returnMode) {
          let stmtType = statement.replace(/\n/g, "").trim().substring(0, 6).toUpperCase();
          let sqlStmt = statement;
          let retValues = [];
          let retObj = {};
          try {
            if (!fromJson && stmtType === "DELETE") {
              sqlStmt = await _UtilsSQLite.deleteSQL(db2, statement, values);
            }
            const mValues = values ? values : [];
            let res;
            if (mValues.length > 0) {
              const mVal = await _UtilsSQLite.replaceUndefinedByNull(mValues);
              res = db2.exec(sqlStmt, mVal);
            } else {
              res = db2.exec(sqlStmt);
            }
            if (returnMode === "all" || returnMode === "one") {
              if (res && res.length > 0) {
                retValues = _UtilsSQLite.getReturnedValues(res[0], returnMode);
              }
            }
            let lastId = await _UtilsSQLite.getLastId(db2);
            retObj["lastId"] = lastId;
            if (retValues != null && retValues.length > 0)
              retObj["values"] = retValues;
            return Promise.resolve(retObj);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`run: ${msg}`));
          }
        }
        static getReturnedValues(result, returnMode) {
          const retValues = [];
          for (let i = 0; i < result.values.length; i++) {
            let row = {};
            for (let j = 0; j < result.columns.length; j++) {
              row[result.columns[j]] = result.values[i][j];
            }
            retValues.push(row);
            if (returnMode === "one")
              break;
          }
          return retValues;
        }
        static async deleteSQL(db2, statement, values) {
          let sqlStmt = statement;
          try {
            const isLast = await _UtilsSQLite.isLastModified(db2, true);
            const isDel = await _UtilsSQLite.isSqlDeleted(db2, true);
            if (!isLast || !isDel) {
              return sqlStmt;
            }
            const whereClause = UtilsSQLStatement.extractWhereClause(sqlStmt);
            if (!whereClause) {
              const msg = "deleteSQL: cannot find a WHERE clause";
              return Promise.reject(new Error(`${msg}`));
            }
            const tableName = UtilsSQLStatement.extractTableName(sqlStmt);
            if (!tableName) {
              const msg = "deleteSQL: cannot find a WHERE clause";
              return Promise.reject(new Error(`${msg}`));
            }
            const colNames = UtilsSQLStatement.extractColumnNames(whereClause);
            if (colNames.length === 0) {
              const msg = "deleteSQL: Did not find column names in the WHERE Statement";
              return Promise.reject(new Error(`${msg}`));
            }
            const setStmt = "sql_deleted = 1";
            const hasToUpdate = await UtilsDelete.findReferencesAndUpdate(db2, tableName, whereClause, colNames, values);
            if (hasToUpdate) {
              const whereStmt = whereClause.endsWith(";") ? whereClause.slice(0, -1) : whereClause;
              sqlStmt = `UPDATE ${tableName} SET ${setStmt} WHERE ${whereStmt} AND sql_deleted = 0;`;
            } else {
              sqlStmt = "";
            }
            return Promise.resolve(sqlStmt);
          } catch (err2) {
            let msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`deleteSQL: ${msg}`));
          }
        }
        static async getTableList(db2) {
          try {
            const result = await UtilsDrop.getTablesNames(db2);
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`getTableList: ${msg}`));
          }
        }
        static async isTableExists(db2, tableName) {
          try {
            let statement = "SELECT name FROM sqlite_master WHERE ";
            statement += `type='table' AND name='${tableName}';`;
            const res = await _UtilsSQLite.queryAll(db2, statement, []);
            const ret = res.length > 0 ? true : false;
            return Promise.resolve(ret);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`isTableExists: ${msg}`));
          }
        }
        /**
         * isLastModified
         * @param db
         * @param isOpen
         */
        static async isLastModified(db2, isOpen) {
          if (!isOpen) {
            return Promise.reject("isLastModified: database not opened");
          }
          try {
            const tableList = await UtilsDrop.getTablesNames(db2);
            for (const table of tableList) {
              const tableNamesTypes = await UtilsJSON.getTableColumnNamesTypes(db2, table);
              const tableColumnNames = tableNamesTypes.names;
              if (tableColumnNames.includes("last_modified")) {
                return Promise.resolve(true);
              }
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`isLastModified: ${msg}`));
          }
        }
        /**
         * isSqlDeleted
         * @param db
         * @param isOpen
         */
        static async isSqlDeleted(db2, isOpen) {
          if (!isOpen) {
            return Promise.reject("isSqlDeleted: database not opened");
          }
          try {
            const tableList = await UtilsDrop.getTablesNames(db2);
            for (const table of tableList) {
              const tableNamesTypes = await UtilsJSON.getTableColumnNamesTypes(db2, table);
              const tableColumnNames = tableNamesTypes.names;
              if (tableColumnNames.includes("sql_deleted")) {
                return Promise.resolve(true);
              }
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`isSqlDeleted: ${msg}`));
          }
        }
        static async replaceUndefinedByNull(values) {
          const retValues = [];
          for (const val of values) {
            let mVal = val;
            if (typeof val === "undefined")
              mVal = null;
            retValues.push(mVal);
          }
          return Promise.resolve(retValues);
        }
        static async backupTables(db2) {
          const msg = "BackupTables: ";
          let alterTables = {};
          try {
            const tables = await UtilsDrop.getTablesNames(db2);
            for (const table of tables) {
              try {
                const colNames = await _UtilsSQLite.backupTable(db2, table);
                alterTables[`${table}`] = colNames;
              } catch (err2) {
                const msge = err2.message ? err2.message : err2;
                return Promise.reject(new Error(`${msg}table ${table}: ${msge}`));
              }
            }
            return Promise.resolve(alterTables);
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`BackupTables: ${msge}`));
          }
        }
        static async backupTable(db2, table) {
          try {
            await _UtilsSQLite.beginTransaction(db2, true);
            const colNames = await _UtilsSQLite.getTableColumnNames(db2, table);
            const tmpTable = `_temp_${table}`;
            const delStmt = `DROP TABLE IF EXISTS ${tmpTable};`;
            await _UtilsSQLite.run(db2, delStmt, [], false, "no");
            let stmt = `ALTER TABLE ${table} RENAME `;
            stmt += `TO ${tmpTable};`;
            const lastId = await _UtilsSQLite.run(db2, stmt, [], false, "no");
            if (lastId < 0) {
              let msg = "BackupTable: lastId < 0";
              try {
                await _UtilsSQLite.rollbackTransaction(db2, true);
              } catch (err2) {
                msg += `: ${err2.message ? err2.message : err2}`;
              }
              return Promise.reject(new Error(`${msg}`));
            } else {
              try {
                await _UtilsSQLite.commitTransaction(db2, true);
                return Promise.resolve(colNames);
              } catch (err2) {
                const msge = err2.message ? err2.message : err2;
                return Promise.reject(new Error(`BackupTable: ${msge}`));
              }
            }
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`BackupTable: ${msge}`));
          }
        }
        static async getTableColumnNames(db2, tableName) {
          let resQuery = [];
          const retNames = [];
          const query2 = `PRAGMA table_info('${tableName}');`;
          try {
            resQuery = await _UtilsSQLite.queryAll(db2, query2, []);
            if (resQuery.length > 0) {
              for (const query3 of resQuery) {
                retNames.push(query3.name);
              }
            }
            return Promise.resolve(retNames);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`GetTableColumnNames: ${msg}`));
          }
        }
        static async findCommonColumns(db2, alterTables) {
          let commonColumns = {};
          try {
            const tables = await UtilsDrop.getTablesNames(db2);
            if (tables.length === 0) {
              return Promise.reject(new Error("FindCommonColumns: get table's names failed"));
            }
            for (const table of tables) {
              const tableNames = await _UtilsSQLite.getTableColumnNames(db2, table);
              const keys = Object.keys(alterTables);
              if (keys.includes(table)) {
                commonColumns[table] = _UtilsSQLite.arraysIntersection(alterTables[table], tableNames);
              }
            }
            return Promise.resolve(commonColumns);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`FindCommonColumns: ${msg}`));
          }
        }
        static arraysIntersection(a1, a2) {
          if (a1 != null && a2 != null) {
            const first = new Set(a1);
            const second = new Set(a2);
            return [...first].filter((item) => second.has(item));
          } else {
            return [];
          }
        }
        static async updateNewTablesData(db2, commonColumns) {
          try {
            await _UtilsSQLite.beginTransaction(db2, true);
            const statements = [];
            const keys = Object.keys(commonColumns);
            keys.forEach((key) => {
              const columns = commonColumns[key].join(",");
              let stmt = `INSERT INTO ${key} `;
              stmt += `(${columns}) `;
              stmt += `SELECT ${columns} FROM _temp_${key};`;
              statements.push(stmt);
            });
            const changes = await _UtilsSQLite.execute(db2, statements.join("\n"), false);
            if (changes < 0) {
              let msg = "updateNewTablesData: changes < 0";
              try {
                await _UtilsSQLite.rollbackTransaction(db2, true);
              } catch (err2) {
                msg += `: ${err2.message ? err2.message : err2}`;
              }
              return Promise.reject(new Error(`${msg}`));
            } else {
              try {
                await _UtilsSQLite.commitTransaction(db2, true);
                return Promise.resolve();
              } catch (err2) {
                const msg = err2.message ? err2.message : err2;
                return Promise.reject(new Error(`updateNewTablesData: ${msg}`));
              }
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`updateNewTablesData: ${msg}`));
          }
        }
      };
      UtilsImportJSON = class _UtilsImportJSON {
        static async createDatabaseSchema(mDB, jsonData) {
          let changes = -1;
          const version2 = jsonData.version;
          try {
            await UtilsSQLite.setVersion(mDB.mDb, version2);
            if (jsonData.mode === "full") {
              await UtilsDrop.dropAll(mDB.mDb);
            }
            changes = await _UtilsImportJSON.createSchema(mDB, jsonData);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(new Error(`CreateDatabaseSchema: ${err2.message}`));
          }
        }
        static async createSchema(mDB, jsonData) {
          let changes = 0;
          const db2 = mDB.mDb;
          try {
            await UtilsSQLite.beginTransaction(db2, true);
            mDB.setIsTransActive(true);
          } catch (err2) {
            return Promise.reject(new Error(`CreateSchema: ${err2.message}`));
          }
          const stmts = await _UtilsImportJSON.createSchemaStatement(jsonData);
          if (stmts.length > 0) {
            const schemaStmt = stmts.join("\n");
            try {
              changes = await UtilsSQLite.execute(db2, schemaStmt, true);
              if (changes < 0) {
                try {
                  await UtilsSQLite.rollbackTransaction(db2, true);
                  mDB.setIsTransActive(false);
                } catch (err2) {
                  return Promise.reject(new Error(`CreateSchema: changes < 0 ${err2.message}`));
                }
              }
            } catch (err2) {
              const msg = err2.message;
              try {
                await UtilsSQLite.rollbackTransaction(db2, true);
                mDB.setIsTransActive(false);
                return Promise.reject(new Error(`CreateSchema: ${msg}`));
              } catch (err3) {
                return Promise.reject(new Error(`CreateSchema: changes < 0 ${err3.message}: ${msg}`));
              }
            }
          }
          try {
            await UtilsSQLite.commitTransaction(db2, true);
            mDB.setIsTransActive(false);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(new Error(`CreateSchema: commit ${err2.message}`));
          }
        }
        static async createSchemaStatement(jsonData) {
          const statements = [];
          let isLastModified = false;
          let isSqlDeleted = false;
          try {
            for (const jTable of jsonData.tables) {
              if (jTable.schema != null && jTable.schema.length >= 1) {
                statements.push(`CREATE TABLE IF NOT EXISTS ${jTable.name} (`);
                for (let j = 0; j < jTable.schema.length; j++) {
                  if (j === jTable.schema.length - 1) {
                    if (jTable.schema[j].column) {
                      statements.push(`${jTable.schema[j].column} ${jTable.schema[j].value}`);
                      if (jTable.schema[j].column === "last_modified") {
                        isLastModified = true;
                      }
                      if (jTable.schema[j].column === "sql_deleted") {
                        isSqlDeleted = true;
                      }
                    } else if (jTable.schema[j].foreignkey) {
                      statements.push(`FOREIGN KEY (${jTable.schema[j].foreignkey}) ${jTable.schema[j].value}`);
                    } else if (jTable.schema[j].constraint) {
                      statements.push(`CONSTRAINT ${jTable.schema[j].constraint} ${jTable.schema[j].value}`);
                    }
                  } else {
                    if (jTable.schema[j].column) {
                      statements.push(`${jTable.schema[j].column} ${jTable.schema[j].value},`);
                    } else if (jTable.schema[j].foreignkey) {
                      statements.push(`FOREIGN KEY (${jTable.schema[j].foreignkey}) ${jTable.schema[j].value},`);
                    } else if (jTable.schema[j].primarykey) {
                      statements.push(`FOREIGN KEY ${jTable.schema[j].value},`);
                    } else if (jTable.schema[j].constraint) {
                      statements.push(`CONSTRAINT ${jTable.schema[j].constraint} ${jTable.schema[j].value},`);
                    }
                  }
                }
                statements.push(");");
                if (isLastModified && isSqlDeleted) {
                  let trig = "CREATE TRIGGER IF NOT EXISTS ";
                  trig += `${jTable.name}`;
                  trig += `_trigger_last_modified `;
                  trig += `AFTER UPDATE ON ${jTable.name} `;
                  trig += "FOR EACH ROW WHEN NEW.last_modified < ";
                  trig += "OLD.last_modified BEGIN UPDATE ";
                  trig += `${jTable.name} `;
                  trig += `SET last_modified = `;
                  trig += "(strftime('%s','now')) WHERE id=OLD.id; END;";
                  statements.push(trig);
                }
              }
              if (jTable.indexes != null && jTable.indexes.length >= 1) {
                for (const jIndex of jTable.indexes) {
                  const tableName = jTable.name;
                  let stmt = `CREATE ${Object.keys(jIndex).includes("mode") ? jIndex.mode + " " : ""} INDEX IF NOT EXISTS `;
                  stmt += `${jIndex.name} ON ${tableName} (${jIndex.value});`;
                  statements.push(stmt);
                }
              }
              if (jTable.triggers != null && jTable.triggers.length >= 1) {
                for (const jTrg of jTable.triggers) {
                  const tableName = jTable.name;
                  if (jTrg.timeevent.toUpperCase().endsWith(" ON")) {
                    jTrg.timeevent = jTrg.timeevent.substring(0, jTrg.timeevent.length - 3);
                  }
                  let stmt = `CREATE TRIGGER IF NOT EXISTS `;
                  stmt += `${jTrg.name} ${jTrg.timeevent} ON ${tableName} `;
                  if (jTrg.condition)
                    stmt += `${jTrg.condition} `;
                  stmt += `${jTrg.logic};`;
                  statements.push(stmt);
                }
              }
            }
            return Promise.resolve(statements);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        static async createTablesData(mDB, jsonData, importProgress) {
          let changes = 0;
          let isValue = false;
          let lastId = -1;
          let msg = "";
          let initChanges = -1;
          const db2 = mDB.mDb;
          try {
            initChanges = await UtilsSQLite.dbChanges(db2);
            await UtilsSQLite.beginTransaction(db2, true);
            mDB.setIsTransActive(true);
          } catch (err2) {
            return Promise.reject(new Error(`createTablesData: ${err2.message}`));
          }
          for (const jTable of jsonData.tables) {
            if (jTable.values != null && jTable.values.length >= 1) {
              try {
                lastId = await _UtilsImportJSON.createTableData(db2, jTable, jsonData.mode);
                const msg2 = `create table data ${jTable.name}`;
                importProgress.emit({ progress: msg2 });
                if (lastId < 0)
                  break;
                isValue = true;
              } catch (err2) {
                msg = err2.message;
                isValue = false;
                break;
              }
            }
          }
          if (isValue) {
            try {
              await UtilsSQLite.commitTransaction(db2, true);
              mDB.setIsTransActive(false);
              changes = await UtilsSQLite.dbChanges(db2) - initChanges;
              return Promise.resolve(changes);
            } catch (err2) {
              return Promise.reject(new Error(`CreateTablesData: ${err2.message}`));
            }
          } else {
            if (msg.length > 0) {
              try {
                await UtilsSQLite.rollbackTransaction(db2, true);
                mDB.setIsTransActive(false);
                return Promise.reject(new Error(`CreateTablesData: ${msg}`));
              } catch (err2) {
                return Promise.reject(new Error(`CreateTablesData: ${err2.message}: ${msg}`));
              }
            } else {
              return Promise.resolve(0);
            }
          }
        }
        static async createTableData(db2, table, mode) {
          let lastId = -1;
          try {
            const tableExists = await UtilsSQLite.isTableExists(db2, table.name);
            if (!tableExists) {
              return Promise.reject(new Error(`CreateTableData: Table ${table.name} does not exist`));
            }
            const tableNamesTypes = await UtilsJSON.getTableColumnNamesTypes(db2, table.name);
            const tableColumnTypes = tableNamesTypes.types;
            const tableColumnNames = tableNamesTypes.names;
            if (tableColumnTypes.length === 0) {
              return Promise.reject(new Error(`CreateTableData: Table ${table.name} info does not exist`));
            }
            for (let j = 0; j < table.values.length; j++) {
              let row = table.values[j];
              let isRun = true;
              const stmt = await _UtilsImportJSON.createRowStatement(db2, tableColumnNames, row, j, table.name, mode);
              isRun = await _UtilsImportJSON.checkUpdate(db2, stmt, row, table.name, tableColumnNames);
              if (isRun) {
                if (stmt.substring(0, 6).toUpperCase() === "DELETE") {
                  row = [];
                }
                lastId = await UtilsSQLite.run(db2, stmt, row, true, "no");
                if (lastId < 0) {
                  return Promise.reject(new Error("CreateTableData: lastId < 0"));
                }
              } else {
                lastId = 0;
              }
            }
            return Promise.resolve(lastId);
          } catch (err2) {
            return Promise.reject(new Error(`CreateTableData: ${err2.message}`));
          }
        }
        static async createRowStatement(db2, tColNames, row, j, tableName, mode) {
          if (row.length != tColNames.length || row.length === 0 || tColNames.length === 0) {
            return Promise.reject(new Error(`CreateRowStatement: Table ${tableName} values row ${j} not correct length`));
          }
          try {
            const retisIdExists = await _UtilsImportJSON.isIdExists(db2, tableName, tColNames[0], row[0]);
            let stmt;
            if (mode === "full" || mode === "partial" && !retisIdExists) {
              const nameString = tColNames.join();
              const questionMarkString = await _UtilsImportJSON.createQuestionMarkString(tColNames.length);
              stmt = `INSERT INTO ${tableName} (${nameString}) VALUES (`;
              stmt += `${questionMarkString});`;
            } else {
              let isUpdate = true;
              const isColDeleted = (element) => element === `sql_deleted`;
              const idxDelete = tColNames.findIndex(isColDeleted);
              if (idxDelete >= 0) {
                if (row[idxDelete] === 1) {
                  isUpdate = false;
                  stmt = `DELETE FROM ${tableName} WHERE `;
                  if (typeof row[0] == "string") {
                    stmt += `${tColNames[0]} = '${row[0]}';`;
                  } else {
                    stmt += `${tColNames[0]} = ${row[0]};`;
                  }
                }
              }
              if (isUpdate) {
                const setString = await _UtilsImportJSON.setNameForUpdate(tColNames);
                if (setString.length === 0) {
                  return Promise.reject(new Error(`CreateRowStatement: Table ${tableName} values row ${j} not set to String`));
                }
                stmt = `UPDATE ${tableName} SET ${setString} WHERE `;
                if (typeof row[0] == "string") {
                  stmt += `${tColNames[0]} = '${row[0]}';`;
                } else {
                  stmt += `${tColNames[0]} = ${row[0]};`;
                }
              }
            }
            return Promise.resolve(stmt);
          } catch (err2) {
            return Promise.reject(new Error(`CreateRowStatement: ${err2.message}`));
          }
        }
        static async checkUpdate(db2, stmt, values, tbName, tColNames) {
          let isRun = true;
          if (stmt.substring(0, 6) === "UPDATE") {
            try {
              let query2 = `SELECT * FROM ${tbName} WHERE `;
              if (typeof values[0] == "string") {
                query2 += `${tColNames[0]} = '${values[0]}';`;
              } else {
                query2 += `${tColNames[0]} = ${values[0]};`;
              }
              const resQuery = await UtilsJSON.getValues(db2, query2, tbName);
              let resValues = [];
              if (resQuery.length > 0) {
                resValues = resQuery[0];
              }
              if (values.length > 0 && resValues.length > 0 && values.length === resValues.length) {
                for (let i = 0; i < values.length; i++) {
                  if (values[i] !== resValues[i]) {
                    return Promise.resolve(true);
                  }
                }
                return Promise.resolve(false);
              } else {
                const msg = "Both arrays not the same length";
                return Promise.reject(new Error(`CheckUpdate: ${msg}`));
              }
            } catch (err2) {
              return Promise.reject(new Error(`CheckUpdate: ${err2.message}`));
            }
          } else {
            return Promise.resolve(isRun);
          }
        }
        static async isIdExists(db2, dbName, firstColumnName, key) {
          let ret = false;
          let query2 = `SELECT ${firstColumnName} FROM ${dbName} WHERE ${firstColumnName} = `;
          if (typeof key === "number")
            query2 += `${key};`;
          if (typeof key === "string")
            query2 += `'${key}';`;
          try {
            const resQuery = await UtilsSQLite.queryAll(db2, query2, []);
            if (resQuery.length === 1)
              ret = true;
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(new Error(`IsIdExists: ${err2.message}`));
          }
        }
        static async isType(type, value) {
          let ret = false;
          if (type === "NULL" && typeof value === "object")
            ret = true;
          if (type === "TEXT" && typeof value === "string")
            ret = true;
          if (type === "INTEGER" && typeof value === "number")
            ret = true;
          if (type === "REAL" && typeof value === "number")
            ret = true;
          if (type === "BLOB" && typeof value === "string")
            ret = true;
          if (ret) {
            return Promise.resolve();
          } else {
            return Promise.reject(new Error("IsType: not a SQL Type"));
          }
        }
        static async checkColumnTypes(tableTypes, rowValues) {
          for (let i = 0; i < rowValues.length; i++) {
            if (rowValues[i] != null) {
              try {
                await _UtilsImportJSON.isType(tableTypes[i], rowValues[i]);
              } catch (err2) {
                return Promise.reject(new Error("CheckColumnTypes: Type not found"));
              }
            }
          }
          return Promise.resolve();
        }
        static async createQuestionMarkString(length) {
          let retString = "";
          for (let i = 0; i < length; i++) {
            retString += "?,";
          }
          if (retString.length > 1) {
            retString = retString.slice(0, -1);
            return Promise.resolve(retString);
          } else {
            return Promise.reject(new Error("CreateQuestionMarkString: length = 0"));
          }
        }
        static async setNameForUpdate(names) {
          let retString = "";
          for (const name of names) {
            retString += `${name} = ? ,`;
          }
          if (retString.length > 1) {
            retString = retString.slice(0, -1);
            return Promise.resolve(retString);
          } else {
            return Promise.reject(new Error("SetNameForUpdate: length = 0"));
          }
        }
        static async createView(db2, view) {
          const stmt = `CREATE VIEW IF NOT EXISTS ${view.name} AS ${view.value};`;
          try {
            const changes = await UtilsSQLite.execute(db2, stmt, true);
            if (changes < 0) {
              return Promise.reject(new Error(`CreateView: ${view.name} failed`));
            }
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(new Error(`CreateView: ${err2.message}`));
          }
        }
        static async createViews(mDB, jsonData) {
          const db2 = mDB.mDb;
          let isView = false;
          let msg = "";
          let initChanges = -1;
          let changes = -1;
          try {
            initChanges = await UtilsSQLite.dbChanges(db2);
            await UtilsSQLite.beginTransaction(db2, true);
            mDB.setIsTransActive(true);
          } catch (err2) {
            return Promise.reject(new Error(`createViews: ${err2.message}`));
          }
          for (const jView of jsonData.views) {
            if (jView.value != null) {
              try {
                await _UtilsImportJSON.createView(db2, jView);
                isView = true;
              } catch (err2) {
                msg = err2.message;
                isView = false;
                break;
              }
            }
          }
          if (isView) {
            try {
              await UtilsSQLite.commitTransaction(db2, true);
              mDB.setIsTransActive(false);
              changes = await UtilsSQLite.dbChanges(db2) - initChanges;
              return Promise.resolve(changes);
            } catch (err2) {
              return Promise.reject(new Error(`createViews: ${err2.message}`));
            }
          } else {
            if (msg.length > 0) {
              try {
                await UtilsSQLite.rollbackTransaction(db2, true);
                mDB.setIsTransActive(false);
                return Promise.reject(new Error(`createViews: ${msg}`));
              } catch (err2) {
                return Promise.reject(new Error(`createViews: ${err2.message}: ${msg}`));
              }
            } else {
              return Promise.resolve(0);
            }
          }
        }
      };
      UtilsExportJSON = class _UtilsExportJSON {
        static async createExportObject(db2, sqlObj, exportProgress) {
          const retObj = {};
          let tables = [];
          let views = [];
          let errmsg = "";
          try {
            views = await _UtilsExportJSON.getViewsName(db2);
            const resTables = await _UtilsExportJSON.getTablesNameSQL(db2);
            if (resTables.length === 0) {
              return Promise.reject(new Error("createExportObject: table's names failed"));
            } else {
              const isTable = await UtilsSQLite.isTableExists(db2, "sync_table");
              if (!isTable && sqlObj.mode === "partial") {
                return Promise.reject(new Error("No sync_table available"));
              }
              switch (sqlObj.mode) {
                case "partial": {
                  tables = await _UtilsExportJSON.getTablesPartial(db2, resTables, exportProgress);
                  break;
                }
                case "full": {
                  tables = await _UtilsExportJSON.getTablesFull(db2, resTables, exportProgress);
                  break;
                }
                default: {
                  errmsg = "createExportObject: expMode " + sqlObj.mode + " not defined";
                  break;
                }
              }
              if (errmsg.length > 0) {
                return Promise.reject(new Error(errmsg));
              }
              if (tables.length > 0) {
                retObj.database = sqlObj.database;
                retObj.version = sqlObj.version;
                retObj.encrypted = sqlObj.encrypted;
                retObj.mode = sqlObj.mode;
                retObj.tables = tables;
                if (views.length > 0) {
                  retObj.views = views;
                }
              }
              return Promise.resolve(retObj);
            }
          } catch (err2) {
            return Promise.reject(new Error("createExportObject: " + err2.message));
          }
        }
        static async getViewsName(mDb) {
          const views = [];
          let sql = "SELECT name,sql FROM sqlite_master WHERE ";
          sql += "type='view' AND name NOT LIKE 'sqlite_%';";
          let retQuery = [];
          try {
            retQuery = await UtilsSQLite.queryAll(mDb, sql, []);
            for (const query2 of retQuery) {
              const view = {};
              view.name = query2.name;
              view.value = query2.sql.substring(query2.sql.indexOf("AS ") + 3);
              views.push(view);
            }
            return Promise.resolve(views);
          } catch (err2) {
            return Promise.reject(new Error(`getViewsName: ${err2.message}`));
          }
        }
        static async getTablesFull(db2, resTables, exportProgress) {
          const tables = [];
          let errmsg = "";
          try {
            for (const rTable of resTables) {
              let tableName;
              let sqlStmt;
              if (rTable.name) {
                tableName = rTable.name;
              } else {
                errmsg = "GetTablesFull: no name";
                break;
              }
              if (rTable.sql) {
                sqlStmt = rTable.sql;
              } else {
                errmsg = "GetTablesFull: no sql";
                break;
              }
              const table = {};
              const schema = await _UtilsExportJSON.getSchema(
                sqlStmt
                /*, tableName*/
              );
              if (schema.length === 0) {
                errmsg = "GetTablesFull: no Schema returned";
                break;
              }
              await UtilsJSON.checkSchemaValidity(schema);
              const indexes = await _UtilsExportJSON.getIndexes(db2, tableName);
              if (indexes.length > 0) {
                await UtilsJSON.checkIndexesValidity(indexes);
              }
              const triggers = await _UtilsExportJSON.getTriggers(db2, tableName);
              if (triggers.length > 0) {
                await UtilsJSON.checkTriggersValidity(triggers);
              }
              let msg = `Full: Table ${tableName} schema export completed ...`;
              exportProgress.emit({ progress: msg });
              const query2 = `SELECT * FROM ${tableName};`;
              const values = await UtilsJSON.getValues(db2, query2, tableName);
              table.name = tableName;
              if (schema.length > 0) {
                table.schema = schema;
              } else {
                errmsg = `GetTablesFull: must contain schema`;
                break;
              }
              if (indexes.length > 0) {
                table.indexes = indexes;
              }
              if (triggers.length > 0) {
                table.triggers = triggers;
              }
              if (values.length > 0) {
                table.values = values;
              }
              if (Object.keys(table).length <= 1) {
                errmsg = `GetTablesFull: table ${tableName} is not a jsonTable`;
                break;
              }
              msg = `Full: Table ${tableName} table data export completed ...`;
              exportProgress.emit({ progress: msg });
              tables.push(table);
            }
            if (errmsg.length > 0) {
              return Promise.reject(new Error(errmsg));
            }
            return Promise.resolve(tables);
          } catch (err2) {
            return Promise.reject(new Error(`GetTablesFull: ${err2.message}`));
          }
        }
        static async getSchema(sqlStmt) {
          const schema = [];
          const openPar = sqlStmt.indexOf("(");
          const closePar = sqlStmt.lastIndexOf(")");
          let sstr = sqlStmt.substring(openPar + 1, closePar);
          try {
            sstr = await _UtilsExportJSON.modEmbeddedParentheses(sstr);
            const sch = sstr.split(",");
            for (let j = 0; j < sch.length; j++) {
              let row = [];
              const scht = sch[j].replace(/\n/g, "").trim();
              row[0] = scht.substring(0, scht.indexOf(" "));
              row[1] = scht.substring(scht.indexOf(" ") + 1);
              const jsonRow = {};
              if (row[0].toUpperCase() === "FOREIGN") {
                const oPar = scht.indexOf("(");
                const cPar = scht.indexOf(")");
                const fk = scht.substring(oPar + 1, cPar);
                const fknames = fk.split("\xA7");
                row[0] = fknames.join(",");
                row[0] = row[0].replace(/, /g, ",");
                row[1] = scht.substring(cPar + 2);
                jsonRow["foreignkey"] = row[0];
              } else if (row[0].toUpperCase() === "PRIMARY") {
                row = _UtilsExportJSON.getRow(scht, "CPK");
                jsonRow["constraint"] = row[0];
              } else if (row[0].toUpperCase() === "UNIQUE") {
                row = _UtilsExportJSON.getRow(scht, "CUN");
                jsonRow["constraint"] = row[0];
              } else if (row[0].toUpperCase() === "CONSTRAINT") {
                let tRow = [];
                const row1t = row[1].trim();
                tRow[0] = row1t.substring(0, row1t.indexOf(" "));
                tRow[1] = row1t.substring(row1t.indexOf(" ") + 1);
                row[0] = tRow[0];
                jsonRow["constraint"] = row[0];
                row[1] = tRow[1];
              } else {
                jsonRow["column"] = row[0];
              }
              jsonRow["value"] = row[1].replace(/§/g, ",");
              schema.push(jsonRow);
            }
            return Promise.resolve(schema);
          } catch (err2) {
            return Promise.reject(new Error(err2.message));
          }
        }
        static getRow(scht, cName) {
          let row = [];
          const oPar = scht.indexOf("(");
          const cPar = scht.indexOf(")");
          const values = scht.substring(oPar + 1, cPar);
          const valuesnames = values.split("\xA7");
          row[0] = `${cName}_` + valuesnames.join("_");
          row[0] = row[0].replace(/_ /g, "_");
          row[1] = scht;
          return row;
        }
        static async getIndexes(db2, tableName) {
          const indexes = [];
          let errmsg = "";
          try {
            let stmt = "SELECT name,tbl_name,sql FROM sqlite_master WHERE ";
            stmt += `type = 'index' AND tbl_name = '${tableName}' `;
            stmt += `AND sql NOTNULL;`;
            const retIndexes = await UtilsSQLite.queryAll(db2, stmt, []);
            if (retIndexes.length > 0) {
              for (const rIndex of retIndexes) {
                const keys = Object.keys(rIndex);
                if (keys.length === 3) {
                  if (rIndex["tbl_name"] === tableName) {
                    const sql = rIndex["sql"];
                    const mode = sql.includes("UNIQUE") ? "UNIQUE" : "";
                    const oPar = sql.lastIndexOf("(");
                    const cPar = sql.lastIndexOf(")");
                    const index = {};
                    index.name = rIndex["name"];
                    index.value = sql.slice(oPar + 1, cPar);
                    if (mode.length > 0)
                      index.mode = mode;
                    indexes.push(index);
                  } else {
                    errmsg = `GetIndexes: Table ${tableName} doesn't match`;
                    break;
                  }
                } else {
                  errmsg = `GetIndexes: Table ${tableName} creating indexes`;
                  break;
                }
              }
              if (errmsg.length > 0) {
                return Promise.reject(new Error(errmsg));
              }
            }
            return Promise.resolve(indexes);
          } catch (err2) {
            return Promise.reject(new Error(`GetIndexes: ${err2.message}`));
          }
        }
        static async getTriggers(db2, tableName) {
          const triggers = [];
          try {
            let stmt = "SELECT name,tbl_name,sql FROM sqlite_master WHERE ";
            stmt += `type = 'trigger' AND tbl_name = '${tableName}' `;
            stmt += `AND sql NOT NULL;`;
            const retTriggers = await UtilsSQLite.queryAll(db2, stmt, []);
            if (retTriggers.length > 0) {
              for (const rTrg of retTriggers) {
                const keys = Object.keys(rTrg);
                if (keys.length === 3) {
                  if (rTrg["tbl_name"] === tableName) {
                    const sql = rTrg["sql"];
                    const name = rTrg["name"];
                    let sqlArr = sql.split(name);
                    if (sqlArr.length != 2) {
                      return Promise.reject(new Error(`GetTriggers: sql split name does not return 2 values`));
                    }
                    if (!sqlArr[1].includes(tableName)) {
                      return Promise.reject(new Error(`GetTriggers: sql split does not contains ${tableName}`));
                    }
                    const timeEvent = sqlArr[1].split(tableName, 1)[0].trim();
                    sqlArr = sqlArr[1].split(timeEvent + " " + tableName);
                    if (sqlArr.length != 2) {
                      return Promise.reject(new Error(`GetTriggers: sql split tableName does not return 2 values`));
                    }
                    let condition = "";
                    let logic = "";
                    if (sqlArr[1].trim().substring(0, 5).toUpperCase() !== "BEGIN") {
                      sqlArr = sqlArr[1].trim().split("BEGIN");
                      if (sqlArr.length != 2) {
                        return Promise.reject(new Error(`GetTriggers: sql split BEGIN does not return 2 values`));
                      }
                      condition = sqlArr[0].trim();
                      logic = "BEGIN" + sqlArr[1];
                    } else {
                      logic = sqlArr[1].trim();
                    }
                    const trigger = {};
                    trigger.name = name;
                    trigger.logic = logic;
                    if (condition.length > 0)
                      trigger.condition = condition;
                    trigger.timeevent = timeEvent;
                    triggers.push(trigger);
                  } else {
                    return Promise.reject(new Error(`GetTriggers: Table ${tableName} doesn't match`));
                  }
                } else {
                  return Promise.reject(new Error(`GetTriggers: Table ${tableName} creating indexes`));
                }
              }
            }
            return Promise.resolve(triggers);
          } catch (err2) {
            return Promise.reject(new Error(`GetTriggers: ${err2.message}`));
          }
        }
        static async getTablesPartial(db2, resTables, exportProgress) {
          const tables = [];
          let modTables = {};
          let syncDate = 0;
          let modTablesKeys = [];
          let errmsg = "";
          try {
            const partialModeData = await _UtilsExportJSON.getPartialModeData(db2, resTables);
            if (Object.keys(partialModeData).includes("syncDate")) {
              syncDate = partialModeData.syncDate;
            }
            if (Object.keys(partialModeData).includes("modTables")) {
              modTables = partialModeData.modTables;
              modTablesKeys = Object.keys(modTables);
            }
            for (const rTable of resTables) {
              let tableName = "";
              let sqlStmt = "";
              if (rTable.name) {
                tableName = rTable.name;
              } else {
                errmsg = "GetTablesFull: no name";
                break;
              }
              if (rTable.sql) {
                sqlStmt = rTable.sql;
              } else {
                errmsg = "GetTablesFull: no sql";
                break;
              }
              if (modTablesKeys.length == 0 || modTablesKeys.indexOf(tableName) === -1 || modTables[tableName] == "No") {
                continue;
              }
              const table = {};
              let schema = [];
              let indexes = [];
              let triggers = [];
              table.name = rTable;
              if (modTables[table.name] === "Create") {
                schema = await _UtilsExportJSON.getSchema(
                  sqlStmt
                  /*, tableName*/
                );
                if (schema.length > 0) {
                  await UtilsJSON.checkSchemaValidity(schema);
                }
                indexes = await _UtilsExportJSON.getIndexes(db2, tableName);
                if (indexes.length > 0) {
                  await UtilsJSON.checkIndexesValidity(indexes);
                }
                triggers = await _UtilsExportJSON.getTriggers(db2, tableName);
                if (triggers.length > 0) {
                  await UtilsJSON.checkTriggersValidity(triggers);
                }
              }
              let msg = `Partial: Table ${tableName} schema export completed ...`;
              exportProgress.emit({ progress: msg });
              let query2 = "";
              if (modTables[tableName] === "Create") {
                query2 = `SELECT * FROM ${tableName};`;
              } else {
                query2 = `SELECT * FROM ${tableName} WHERE last_modified > ${syncDate};`;
              }
              const values = await UtilsJSON.getValues(db2, query2, tableName);
              table.name = tableName;
              if (schema.length > 0) {
                table.schema = schema;
              }
              if (indexes.length > 0) {
                table.indexes = indexes;
              }
              if (triggers.length > 0) {
                table.triggers = triggers;
              }
              if (values.length > 0) {
                table.values = values;
              }
              if (Object.keys(table).length <= 1) {
                errmsg = `GetTablesPartial: table ${tableName} is not a jsonTable`;
                break;
              }
              msg = `Partial: Table ${tableName} table data export completed ...`;
              exportProgress.emit({ progress: msg });
              tables.push(table);
            }
            if (errmsg.length > 0) {
              return Promise.reject(new Error(errmsg));
            }
            return Promise.resolve(tables);
          } catch (err2) {
            return Promise.reject(new Error(`GetTablesPartial: ${err2.message}`));
          }
        }
        static async getPartialModeData(db2, resTables) {
          const retData = {};
          try {
            const syncDate = await _UtilsExportJSON.getSynchroDate(db2);
            if (syncDate <= 0) {
              return Promise.reject(new Error(`GetPartialModeData: no syncDate`));
            }
            const modTables = await _UtilsExportJSON.getTablesModified(db2, resTables, syncDate);
            if (modTables.length <= 0) {
              return Promise.reject(new Error(`GetPartialModeData: no modTables`));
            }
            retData.syncDate = syncDate;
            retData.modTables = modTables;
            return Promise.resolve(retData);
          } catch (err2) {
            return Promise.reject(new Error(`GetPartialModeData: ${err2.message}`));
          }
        }
        static async getTablesNameSQL(db2) {
          let sql = "SELECT name,sql FROM sqlite_master WHERE ";
          sql += "type='table' AND name NOT LIKE 'sync_table' ";
          sql += "AND name NOT LIKE '_temp_%' ";
          sql += "AND name NOT LIKE 'sqlite_%';";
          try {
            const retQuery = await UtilsSQLite.queryAll(db2, sql, []);
            return Promise.resolve(retQuery);
          } catch (err2) {
            return Promise.reject(new Error(`getTablesNamesSQL: ${err2.message}`));
          }
        }
        static async getTablesModified(db2, tables, syncDate) {
          let errmsg = "";
          try {
            const retModified = {};
            for (const rTable of tables) {
              let mode;
              let stmt = "SELECT count(*) AS tcount  ";
              stmt += `FROM ${rTable.name};`;
              let retQuery = await UtilsSQLite.queryAll(db2, stmt, []);
              if (retQuery.length != 1) {
                errmsg = "GetTableModified: total count not returned";
                break;
              }
              const totalCount = retQuery[0]["tcount"];
              stmt = "SELECT count(*) AS mcount FROM ";
              stmt += `${rTable.name} WHERE last_modified > `;
              stmt += `${syncDate};`;
              retQuery = await UtilsSQLite.queryAll(db2, stmt, []);
              if (retQuery.length != 1)
                break;
              const totalModifiedCount = retQuery[0]["mcount"];
              if (totalModifiedCount === 0) {
                mode = "No";
              } else if (totalCount === totalModifiedCount) {
                mode = "Create";
              } else {
                mode = "Modified";
              }
              const key = rTable.name;
              retModified[key] = mode;
            }
            if (errmsg.length > 0) {
              return Promise.reject(new Error(errmsg));
            }
            return Promise.resolve(retModified);
          } catch (err2) {
            return Promise.reject(new Error(`GetTableModified: ${err2.message}`));
          }
        }
        static async getSynchroDate(db2) {
          try {
            const stmt = `SELECT sync_date FROM sync_table WHERE id = 1;`;
            const res = await UtilsSQLite.queryAll(db2, stmt, []);
            return Promise.resolve(res[0]["sync_date"]);
          } catch (err2) {
            const msg = `GetSynchroDate: ${err2.message}`;
            return Promise.reject(new Error(msg));
          }
        }
        static async getLastExportDate(db2) {
          try {
            const stmt = `SELECT sync_date FROM sync_table WHERE id = 2;`;
            const res = await UtilsSQLite.queryAll(db2, stmt, []);
            if (res.length === 0) {
              return Promise.resolve(-1);
            } else {
              return Promise.resolve(res[0]["sync_date"]);
            }
          } catch (err2) {
            const msg = `getLastExport: ${err2.message}`;
            return Promise.reject(new Error(msg));
          }
        }
        static async setLastExportDate(db2, lastExportedDate) {
          try {
            const isTable = await UtilsSQLite.isTableExists(db2, "sync_table");
            if (!isTable) {
              return Promise.reject(new Error("setLastExportDate: No sync_table available"));
            }
            const sDate = Math.round(new Date(lastExportedDate).getTime() / 1e3);
            let stmt = "";
            if (await _UtilsExportJSON.getLastExportDate(db2) > 0) {
              stmt = `UPDATE sync_table SET sync_date = ${sDate} WHERE id = 2;`;
            } else {
              stmt = `INSERT INTO sync_table (sync_date) VALUES (${sDate});`;
            }
            const changes = await UtilsSQLite.execute(db2, stmt, false);
            if (changes < 0) {
              return { result: false, message: "setLastExportDate failed" };
            } else {
              return { result: true };
            }
          } catch (err2) {
            return { result: false, message: `setLastExportDate failed: ${err2.message}` };
          }
        }
        static async delExportedRows(db2) {
          let lastExportDate;
          try {
            const isTable = await UtilsSQLite.isTableExists(db2, "sync_table");
            if (!isTable) {
              return Promise.reject(new Error("DelExportedRows: No sync_table available"));
            }
            lastExportDate = await _UtilsExportJSON.getLastExportDate(db2);
            if (lastExportDate < 0) {
              return Promise.reject(new Error("DelExportedRows: no last exported date available"));
            }
            const resTables = await UtilsSQLite.getTableList(db2);
            if (resTables.length === 0) {
              return Promise.reject(new Error("DelExportedRows: No table's names returned"));
            }
            for (const table of resTables) {
              let lastId = -1;
              const delStmt = `DELETE FROM ${table}
              WHERE sql_deleted = 1 AND last_modified < ${lastExportDate};`;
              lastId = await UtilsSQLite.run(db2, delStmt, [], true, "no");
              if (lastId < 0) {
                return Promise.reject(new Error("DelExportedRows: lastId < 0"));
              }
            }
          } catch (err2) {
            return Promise.reject(new Error(`DelExportedRows failed: ${err2.message}`));
          }
        }
        static async modEmbeddedParentheses(sstr) {
          const oParArray = _UtilsExportJSON.indexOfChar(sstr, "(");
          const cParArray = _UtilsExportJSON.indexOfChar(sstr, ")");
          if (oParArray.length != cParArray.length) {
            return Promise.reject("ModEmbeddedParentheses: Not same number of '(' & ')'");
          }
          if (oParArray.length === 0) {
            return Promise.resolve(sstr);
          }
          let resStmt = sstr.substring(0, oParArray[0] - 1);
          for (let i = 0; i < oParArray.length; i++) {
            let str;
            if (i < oParArray.length - 1) {
              if (oParArray[i + 1] < cParArray[i]) {
                str = sstr.substring(oParArray[i] - 1, cParArray[i + 1]);
                i++;
              } else {
                str = sstr.substring(oParArray[i] - 1, cParArray[i]);
              }
            } else {
              str = sstr.substring(oParArray[i] - 1, cParArray[i]);
            }
            const newS = str.replace(/,/g, "\xA7");
            resStmt += newS;
            if (i < oParArray.length - 1) {
              resStmt += sstr.substring(cParArray[i], oParArray[i + 1] - 1);
            }
          }
          resStmt += sstr.substring(cParArray[cParArray.length - 1], sstr.length);
          return Promise.resolve(resStmt);
        }
        static indexOfChar(str, char) {
          let tmpArr = [...str];
          char = char.toLowerCase();
          return tmpArr.reduce((results, elem, idx) => elem.toLowerCase() === char ? [...results, idx] : results, []);
        }
      };
      UtilsUpgrade = class _UtilsUpgrade {
        static async onUpgrade(mDB, vUpgDict, curVersion, targetVersion) {
          let changes = -1;
          const sortedKeys = new Int32Array(Object.keys(vUpgDict).map((item) => parseInt(item))).sort();
          for (const versionKey of sortedKeys) {
            if (versionKey > curVersion && versionKey <= targetVersion) {
              const statements = vUpgDict[versionKey].statements;
              if (statements.length === 0) {
                return Promise.reject("onUpgrade: statements not given");
              }
              try {
                await UtilsSQLite.setForeignKeyConstraintsEnabled(mDB.mDb, false);
                const initChanges = await UtilsSQLite.dbChanges(mDB.mDb);
                await _UtilsUpgrade.executeStatementsProcess(mDB, statements);
                await UtilsSQLite.setVersion(mDB.mDb, versionKey);
                await UtilsSQLite.setForeignKeyConstraintsEnabled(mDB.mDb, true);
                changes = await UtilsSQLite.dbChanges(mDB.mDb) - initChanges;
              } catch (err2) {
                return Promise.reject(new Error(`onUpgrade: ${err2.message}`));
              }
            }
          }
          return Promise.resolve(changes);
        }
        static async executeStatementsProcess(mDB, statements) {
          try {
            await UtilsSQLite.beginTransaction(mDB.mDb, true);
            mDB.setIsTransActive(true);
            for (const statement of statements) {
              await UtilsSQLite.execute(mDB.mDb, statement, false);
            }
            await UtilsSQLite.commitTransaction(mDB.mDb, true);
            mDB.setIsTransActive(false);
            return Promise.resolve();
          } catch (err2) {
            await UtilsSQLite.rollbackTransaction(mDB.mDb, true);
            mDB.setIsTransActive(false);
            return Promise.reject(`ExecuteStatementProcess: ${err2}`);
          }
        }
      };
      Database = class {
        constructor(databaseName, version2, upgDict, store, autoSave, wasmPath) {
          this.vUpgDict = {};
          this.autoSave = false;
          this.wasmPath = "/assets";
          this.isBackup = false;
          this.isTransactionActive = false;
          this.dbName = databaseName;
          this.store = store;
          this.version = version2;
          this.mDb = null;
          this.vUpgDict = upgDict;
          this._isDBOpen = false;
          this.autoSave = autoSave;
          this.wasmPath = wasmPath;
        }
        async open() {
          const config2 = {
            locateFile: (file) => `${this.wasmPath}/${file}`
          };
          return new Promise((resolve2, reject) => {
            try {
              initSqlJs(config2).then(async (SQL) => {
                const retDB = await UtilsStore.getDBFromStore(this.dbName, this.store);
                if (retDB != null) {
                  this.mDb = new SQL.Database(retDB);
                } else {
                  this.mDb = new SQL.Database();
                  await UtilsStore.setInitialDBToStore(this.dbName, this.store);
                }
                this._isDBOpen = true;
                let curVersion = await UtilsSQLite.getVersion(this.mDb);
                if (this.version > curVersion && Object.keys(this.vUpgDict).length > 0) {
                  try {
                    const isDB = await UtilsStore.isDBInStore(this.dbName, this.store);
                    if (isDB) {
                      await UtilsStore.copyDBToStore(this.dbName, `backup-${this.dbName}`, this.store);
                      this.isBackup = true;
                    }
                    const changes = await UtilsUpgrade.onUpgrade(this, this.vUpgDict, curVersion, this.version);
                    if (changes === -1) {
                      try {
                        if (this.isBackup) {
                          await UtilsStore.restoreDBFromStore(this.dbName, "backup", this.store);
                        }
                      } catch (err2) {
                        const msg = err2.message ? err2.message : err2;
                        return reject(new Error(`Open: ${msg}`));
                      }
                    }
                    if (this.isBackup) {
                      await UtilsStore.removeDBFromStore(`backup-${this.dbName}`, this.store);
                    }
                  } catch (err2) {
                    try {
                      if (this.isBackup) {
                        await UtilsStore.restoreDBFromStore(this.dbName, "backup", this.store);
                      }
                    } catch (err3) {
                      const msg = err3.message ? err3.message : err3;
                      return reject(new Error(`Open: ${msg}`));
                    }
                  }
                }
                if (this.autoSave) {
                  try {
                    await this.saveToStore();
                  } catch (err2) {
                    this._isDBOpen = false;
                    const msg = err2.message ? err2.message : err2;
                    return reject(new Error(`Open: ${msg}`));
                  }
                }
                await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);
                return resolve2();
              });
            } catch (err2) {
              this._isDBOpen = false;
              const msg = err2.message ? err2.message : err2;
              return reject(new Error(`Open: ${msg}`));
            }
          });
        }
        isDBOpen() {
          return this._isDBOpen;
        }
        async close() {
          if (this.mDb != null && this._isDBOpen) {
            try {
              await this.saveToStore(false);
              this.mDb.close();
              this._isDBOpen = false;
            } catch (err2) {
              this._isDBOpen = false;
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`in close ${msg}`));
            }
          }
          return Promise.resolve();
        }
        async saveToStore(setFK = true) {
          if (this.mDb != null && this._isDBOpen) {
            try {
              await UtilsStore.setDBToStore(this.mDb, this.dbName, this.store);
              if (setFK) {
                await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);
              }
            } catch (err2) {
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`in saveToStore ${msg}`));
            }
          }
          return Promise.resolve();
        }
        async exportDB() {
          try {
            const data = this.mDb.export();
            return data;
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`exportDB: ${msg}`));
          }
        }
        async getVersion() {
          if (this.mDb != null && this._isDBOpen) {
            try {
              const curVersion = await UtilsSQLite.getVersion(this.mDb);
              return Promise.resolve(curVersion);
            } catch (err2) {
              this._isDBOpen = false;
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`in getVersion ${msg}`));
            }
          }
        }
        async isDBExists(database) {
          try {
            const isExists = await UtilsStore.isDBInStore(database, this.store);
            return Promise.resolve(isExists);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`in isDBExists ${msg}`));
          }
        }
        async deleteDB(database) {
          try {
            const isExists = await this.isDBExists(database);
            if (isExists && !this._isDBOpen) {
              await this.open();
            }
            await this.close();
            if (isExists) {
              await UtilsStore.removeDBFromStore(database, this.store);
            }
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`DeleteDB: ${msg}`));
          }
        }
        async beginTransaction() {
          if (!this._isDBOpen) {
            let msg = `BeginTransaction: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            await UtilsSQLite.beginTransaction(this.mDb, true);
            this.setIsTransActive(true);
            return 0;
          } catch (err2) {
            let msg = `BeginTransaction: ${err2.message ? err2.message : err2}`;
            return Promise.reject(new Error(`${msg}`));
          }
        }
        async commitTransaction() {
          if (!this._isDBOpen) {
            let msg = `CommitTransaction: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            await UtilsSQLite.commitTransaction(this.mDb, true);
            this.setIsTransActive(false);
            return 0;
          } catch (err2) {
            let msg = `CommitTransaction: ${err2.message ? err2.message : err2}`;
            return Promise.reject(new Error(`${msg}`));
          }
        }
        async rollbackTransaction() {
          if (!this._isDBOpen) {
            let msg = `RollbackTransaction: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            await UtilsSQLite.rollbackTransaction(this.mDb, true);
            this.setIsTransActive(false);
            return 0;
          } catch (err2) {
            let msg = `RollbackTransaction: ${err2.message ? err2.message : err2}`;
            return Promise.reject(new Error(`${msg}`));
          }
        }
        isTransActive() {
          return this.isTransactionActive;
        }
        setIsTransActive(value) {
          this.isTransactionActive = value;
        }
        async executeSQL(sql, transaction = true) {
          if (!this._isDBOpen) {
            let msg = `ExecuteSQL: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          let initChanges = -1;
          try {
            initChanges = await UtilsSQLite.dbChanges(this.mDb);
            if (transaction && !this.isTransactionActive) {
              await this.beginTransaction();
            }
          } catch (err2) {
            let msg = `executeSQL: ${err2.message ? err2.message : err2}`;
            return Promise.reject(new Error(`${msg}`));
          }
          try {
            const mChanges = await UtilsSQLite.execute(this.mDb, sql, false);
            if (mChanges < 0) {
              return Promise.reject(new Error("ExecuteSQL: changes < 0"));
            }
            if (transaction && this.isTransactionActive) {
              await this.commitTransaction();
            }
            const changes = await UtilsSQLite.dbChanges(this.mDb) - initChanges;
            return Promise.resolve(changes);
          } catch (err2) {
            let msg = `ExecuteSQL: ${err2.message ? err2.message : err2}`;
            try {
              if (transaction && this.isTransactionActive)
                await this.rollbackTransaction();
            } catch (err3) {
              msg += ` : ${err3.message ? err3.message : err3}`;
            }
            return Promise.reject(new Error(`ExecuteSQL: ${msg}`));
          } finally {
            if (transaction)
              this.isTransactionActive = false;
            if (this.autoSave && !this.isTransactionActive) {
              try {
                await this.saveToStore();
              } catch (err2) {
                this._isDBOpen = false;
                const msg = err2.message ? err2.message : err2;
                return Promise.reject(`ExecuteSQL: ${msg}`);
              }
            }
          }
        }
        async execSet(set, transaction = true, returnMode = "no") {
          if (!this._isDBOpen) {
            let msg = `ExecSet: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          const retRes = { changes: -1, lastId: -1 };
          let initChanges = -1;
          try {
            initChanges = await UtilsSQLite.dbChanges(this.mDb);
            if (transaction && !this.isTransactionActive) {
              await this.beginTransaction();
            }
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            let msg = `ExecSet: ${msge}`;
            return Promise.reject(new Error(`${msg}`));
          }
          try {
            const retObj = await UtilsSQLite.executeSet(this.mDb, set, false, returnMode);
            let lastId = retObj["lastId"];
            if (lastId < 0) {
              return Promise.reject(new Error("ExecSet: changes < 0"));
            }
            if (transaction && this.isTransactionActive)
              await this.commitTransaction();
            const changes = await UtilsSQLite.dbChanges(this.mDb) - initChanges;
            retRes.changes = changes;
            retRes.lastId = lastId;
            retRes.values = retObj["values"] ? retObj["values"] : [];
            return Promise.resolve(retRes);
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            let msg = `ExecSet: ${msge}`;
            try {
              if (transaction && this.isTransactionActive)
                await this.rollbackTransaction();
            } catch (err3) {
              msg += ` : ${err3.message ? err3.message : err3}`;
            }
            return Promise.reject(new Error(`ExecSet: ${msg}`));
          } finally {
            if (transaction)
              this.isTransactionActive = false;
            if (this.autoSave && !this.isTransactionActive) {
              try {
                await this.saveToStore();
              } catch (err2) {
                const msg = err2.message ? err2.message : err2;
                this._isDBOpen = false;
                return Promise.reject(`ExecSet: ${msg}`);
              }
            }
          }
        }
        async selectSQL(sql, values) {
          if (!this._isDBOpen) {
            let msg = `SelectSQL: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            let retArr = await UtilsSQLite.queryAll(this.mDb, sql, values);
            return Promise.resolve(retArr);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`SelectSQL: ${msg}`));
          }
        }
        async runSQL(statement, values, transaction = true, returnMode) {
          let lastId = -1;
          if (!this._isDBOpen) {
            let msg = `RunSQL: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          const retRes = { changes: -1, lastId: -1 };
          let initChanges = -1;
          try {
            initChanges = await UtilsSQLite.dbChanges(this.mDb);
            if (transaction && !this.isTransactionActive) {
              await this.beginTransaction();
            }
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            let msg = `RunSQL: ${msge}`;
            return Promise.reject(new Error(`${msg}`));
          }
          try {
            const retObj = await UtilsSQLite.run(this.mDb, statement, values, false, returnMode);
            lastId = retObj["lastId"];
            if (lastId < 0) {
              return Promise.reject(new Error("RunSQL: lastId < 0"));
            }
            if (transaction && this.isTransactionActive) {
              await this.commitTransaction();
            }
            const changes = await UtilsSQLite.dbChanges(this.mDb) - initChanges;
            retRes.changes = changes;
            retRes.lastId = lastId;
            retRes.values = retObj["values"] ? retObj["values"] : [];
            return Promise.resolve(retRes);
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            let msg = `RunSQL: ${msge}`;
            try {
              if (transaction && this.isTransactionActive) {
                await this.rollbackTransaction();
              }
            } catch (err3) {
              msg += ` : ${err3.message ? err3.message : err3}`;
            }
            return Promise.reject(new Error(`${msg}`));
          } finally {
            if (transaction)
              this.setIsTransActive(false);
            if (this.autoSave && !this.isTransactionActive) {
              try {
                await this.saveToStore();
              } catch (err2) {
                this._isDBOpen = false;
                const msg = err2.message ? err2.message : err2;
                return Promise.reject(`ExecSet: ${msg}`);
              }
            }
          }
        }
        async getTableNames() {
          if (!this._isDBOpen) {
            let msg = `GetTableNames: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            let retArr = await UtilsSQLite.getTableList(this.mDb);
            return Promise.resolve(retArr);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(new Error(`GetTableNames: ${msg}`));
          }
        }
        async isTable(tableName) {
          if (!this._isDBOpen) {
            let msg = `isTable: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            const retB = await UtilsSQLite.isTableExists(this.mDb, tableName);
            return Promise.resolve(retB);
          } catch (err2) {
            const msg = `IsTable: ${err2.message ? err2.message : err2}`;
            return Promise.reject(new Error(msg));
          }
        }
        async createSyncTable() {
          if (!this._isDBOpen) {
            let msg = `createSyncTable: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          let changes = -1;
          try {
            const retB = await UtilsSQLite.isTableExists(this.mDb, "sync_table");
            if (!retB) {
              const isLastMod = await UtilsSQLite.isLastModified(this.mDb, this._isDBOpen);
              const isDel = await UtilsSQLite.isSqlDeleted(this.mDb, this._isDBOpen);
              if (isLastMod && isDel) {
                const date = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
                let stmts = `
                          CREATE TABLE IF NOT EXISTS sync_table (
                              id INTEGER PRIMARY KEY NOT NULL,
                              sync_date INTEGER
                              );`;
                stmts += `INSERT INTO sync_table (sync_date) VALUES (
                              "${date}");`;
                changes = await UtilsSQLite.execute(this.mDb, stmts, false);
                return Promise.resolve(changes);
              } else {
                return Promise.reject(new Error("No last_modified/sql_deleted columns in tables"));
              }
            } else {
              return Promise.resolve(0);
            }
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            const msg = `CreateSyncTable: ${msge}`;
            return Promise.reject(new Error(msg));
          }
        }
        async getSyncDate() {
          if (!this._isDBOpen) {
            let msg = `getSyncDate: Database ${this.dbName} `;
            msg += `not opened`;
            return Promise.reject(new Error(msg));
          }
          try {
            const isTable = await UtilsSQLite.isTableExists(this.mDb, "sync_table");
            if (!isTable) {
              return Promise.reject(new Error("No sync_table available"));
            }
            const res = await UtilsExportJSON.getSynchroDate(this.mDb);
            return Promise.resolve(res);
          } catch (err2) {
            const msge = err2.message ? err2.message : err2;
            const msg = `getSyncDate: ${msge}`;
            return Promise.reject(new Error(msg));
          }
        }
        async setSyncDate(syncDate) {
          if (!this._isDBOpen) {
            let msg = `SetSyncDate: Database ${this.dbName} `;
            msg += `not opened`;
            return { result: false, message: msg };
          }
          try {
            const isTable = await UtilsSQLite.isTableExists(this.mDb, "sync_table");
            if (!isTable) {
              return Promise.reject(new Error("No sync_table available"));
            }
            const sDate = Math.round(new Date(syncDate).getTime() / 1e3);
            let stmt = `UPDATE sync_table SET sync_date = `;
            stmt += `${sDate} WHERE id = 1;`;
            const changes = await UtilsSQLite.execute(this.mDb, stmt, false);
            if (changes < 0) {
              return { result: false, message: "setSyncDate failed" };
            } else {
              return { result: true };
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return { result: false, message: `setSyncDate failed: ${msg}` };
          }
        }
        async importJson(jsonData, importProgress) {
          let changes = 0;
          if (this._isDBOpen) {
            try {
              await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, false);
              if (jsonData.tables && jsonData.tables.length > 0) {
                changes = await UtilsImportJSON.createDatabaseSchema(this, jsonData);
                let msg = `Schema creation completed changes: ${changes}`;
                importProgress.emit({ progress: msg });
                if (changes != -1) {
                  changes += await UtilsImportJSON.createTablesData(this, jsonData, importProgress);
                  let msg2 = `Tables data creation completed changes: ${changes}`;
                  importProgress.emit({ progress: msg2 });
                }
              }
              if (jsonData.views && jsonData.views.length > 0) {
                changes += await UtilsImportJSON.createViews(this, jsonData);
              }
              await UtilsSQLite.setForeignKeyConstraintsEnabled(this.mDb, true);
              await this.saveToStore();
              return Promise.resolve(changes);
            } catch (err2) {
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`ImportJson: ${msg}`));
            }
          } else {
            return Promise.reject(new Error(`ImportJson: database is closed`));
          }
        }
        async exportJson(mode, exportProgress) {
          const inJson = {};
          inJson.database = this.dbName.slice(0, -9);
          inJson.version = this.version;
          inJson.encrypted = false;
          inJson.mode = mode;
          if (this._isDBOpen) {
            try {
              const isTable = await UtilsSQLite.isTableExists(this.mDb, "sync_table");
              if (isTable) {
                await UtilsExportJSON.setLastExportDate(this.mDb, (/* @__PURE__ */ new Date()).toISOString());
              } else {
                if (inJson.mode !== "full") {
                  const msg = `No sync_table available for partial mode`;
                  return Promise.reject(new Error(msg));
                }
              }
              const retJson = await UtilsExportJSON.createExportObject(this.mDb, inJson, exportProgress);
              const keys = Object.keys(retJson);
              if (keys.length === 0) {
                const msg = `ExportJson: return Object is empty No data to synchronize`;
                return Promise.reject(new Error(msg));
              }
              const isValid = UtilsJSON.isJsonSQLite(retJson);
              if (isValid) {
                return Promise.resolve(retJson);
              } else {
                return Promise.reject(new Error(`ExportJson: retJson not valid`));
              }
            } catch (err2) {
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`ExportJson: ${msg}`));
            }
          } else {
            return Promise.reject(new Error(`ExportJson: database is closed`));
          }
        }
        async deleteExportedRows() {
          if (this._isDBOpen) {
            try {
              await UtilsExportJSON.delExportedRows(this.mDb);
              return Promise.resolve();
            } catch (err2) {
              const msg = err2.message ? err2.message : err2;
              return Promise.reject(new Error(`deleteExportedRows: ${msg}`));
            }
          } else {
            return Promise.reject(new Error(`deleteExportedRows: database is closed`));
          }
        }
      };
      localforage = { exports: {} };
      (function(module, exports) {
        (function(f2) {
          {
            module.exports = f2();
          }
        })(function() {
          return (function e2(t2, n2, r) {
            function s2(o3, u2) {
              if (!n2[o3]) {
                if (!t2[o3]) {
                  var a2 = typeof commonjsRequire == "function" && commonjsRequire;
                  if (!u2 && a2) return a2(o3, true);
                  if (i) return i(o3, true);
                  var f2 = new Error("Cannot find module '" + o3 + "'");
                  throw f2.code = "MODULE_NOT_FOUND", f2;
                }
                var l2 = n2[o3] = { exports: {} };
                t2[o3][0].call(l2.exports, function(e3) {
                  var n3 = t2[o3][1][e3];
                  return s2(n3 ? n3 : e3);
                }, l2, l2.exports, e2, t2, n2, r);
              }
              return n2[o3].exports;
            }
            var i = typeof commonjsRequire == "function" && commonjsRequire;
            for (var o2 = 0; o2 < r.length; o2++) s2(r[o2]);
            return s2;
          })({ 1: [function(_dereq_, module2, exports2) {
            (function(global2) {
              var Mutation = global2.MutationObserver || global2.WebKitMutationObserver;
              var scheduleDrain;
              {
                if (Mutation) {
                  var called = 0;
                  var observer = new Mutation(nextTick3);
                  var element = global2.document.createTextNode("");
                  observer.observe(element, {
                    characterData: true
                  });
                  scheduleDrain = function() {
                    element.data = called = ++called % 2;
                  };
                } else if (!global2.setImmediate && typeof global2.MessageChannel !== "undefined") {
                  var channel = new global2.MessageChannel();
                  channel.port1.onmessage = nextTick3;
                  scheduleDrain = function() {
                    channel.port2.postMessage(0);
                  };
                } else if ("document" in global2 && "onreadystatechange" in global2.document.createElement("script")) {
                  scheduleDrain = function() {
                    var scriptEl = global2.document.createElement("script");
                    scriptEl.onreadystatechange = function() {
                      nextTick3();
                      scriptEl.onreadystatechange = null;
                      scriptEl.parentNode.removeChild(scriptEl);
                      scriptEl = null;
                    };
                    global2.document.documentElement.appendChild(scriptEl);
                  };
                } else {
                  scheduleDrain = function() {
                    setTimeout(nextTick3, 0);
                  };
                }
              }
              var draining2;
              var queue2 = [];
              function nextTick3() {
                draining2 = true;
                var i, oldQueue;
                var len = queue2.length;
                while (len) {
                  oldQueue = queue2;
                  queue2 = [];
                  i = -1;
                  while (++i < len) {
                    oldQueue[i]();
                  }
                  len = queue2.length;
                }
                draining2 = false;
              }
              module2.exports = immediate;
              function immediate(task) {
                if (queue2.push(task) === 1 && !draining2) {
                  scheduleDrain();
                }
              }
            }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
          }, {}], 2: [function(_dereq_, module2, exports2) {
            var immediate = _dereq_(1);
            function INTERNAL() {
            }
            var handlers = {};
            var REJECTED = ["REJECTED"];
            var FULFILLED = ["FULFILLED"];
            var PENDING = ["PENDING"];
            module2.exports = Promise2;
            function Promise2(resolver) {
              if (typeof resolver !== "function") {
                throw new TypeError("resolver must be a function");
              }
              this.state = PENDING;
              this.queue = [];
              this.outcome = void 0;
              if (resolver !== INTERNAL) {
                safelyResolveThenable(this, resolver);
              }
            }
            Promise2.prototype["catch"] = function(onRejected) {
              return this.then(null, onRejected);
            };
            Promise2.prototype.then = function(onFulfilled, onRejected) {
              if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
                return this;
              }
              var promise = new this.constructor(INTERNAL);
              if (this.state !== PENDING) {
                var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
                unwrap2(promise, resolver, this.outcome);
              } else {
                this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
              }
              return promise;
            };
            function QueueItem(promise, onFulfilled, onRejected) {
              this.promise = promise;
              if (typeof onFulfilled === "function") {
                this.onFulfilled = onFulfilled;
                this.callFulfilled = this.otherCallFulfilled;
              }
              if (typeof onRejected === "function") {
                this.onRejected = onRejected;
                this.callRejected = this.otherCallRejected;
              }
            }
            QueueItem.prototype.callFulfilled = function(value) {
              handlers.resolve(this.promise, value);
            };
            QueueItem.prototype.otherCallFulfilled = function(value) {
              unwrap2(this.promise, this.onFulfilled, value);
            };
            QueueItem.prototype.callRejected = function(value) {
              handlers.reject(this.promise, value);
            };
            QueueItem.prototype.otherCallRejected = function(value) {
              unwrap2(this.promise, this.onRejected, value);
            };
            function unwrap2(promise, func, value) {
              immediate(function() {
                var returnValue;
                try {
                  returnValue = func(value);
                } catch (e2) {
                  return handlers.reject(promise, e2);
                }
                if (returnValue === promise) {
                  handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
                } else {
                  handlers.resolve(promise, returnValue);
                }
              });
            }
            handlers.resolve = function(self2, value) {
              var result = tryCatch(getThen, value);
              if (result.status === "error") {
                return handlers.reject(self2, result.value);
              }
              var thenable = result.value;
              if (thenable) {
                safelyResolveThenable(self2, thenable);
              } else {
                self2.state = FULFILLED;
                self2.outcome = value;
                var i = -1;
                var len = self2.queue.length;
                while (++i < len) {
                  self2.queue[i].callFulfilled(value);
                }
              }
              return self2;
            };
            handlers.reject = function(self2, error) {
              self2.state = REJECTED;
              self2.outcome = error;
              var i = -1;
              var len = self2.queue.length;
              while (++i < len) {
                self2.queue[i].callRejected(error);
              }
              return self2;
            };
            function getThen(obj) {
              var then = obj && obj.then;
              if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
                return function appyThen() {
                  then.apply(obj, arguments);
                };
              }
            }
            function safelyResolveThenable(self2, thenable) {
              var called = false;
              function onError(value) {
                if (called) {
                  return;
                }
                called = true;
                handlers.reject(self2, value);
              }
              function onSuccess(value) {
                if (called) {
                  return;
                }
                called = true;
                handlers.resolve(self2, value);
              }
              function tryToUnwrap() {
                thenable(onSuccess, onError);
              }
              var result = tryCatch(tryToUnwrap);
              if (result.status === "error") {
                onError(result.value);
              }
            }
            function tryCatch(func, value) {
              var out = {};
              try {
                out.value = func(value);
                out.status = "success";
              } catch (e2) {
                out.status = "error";
                out.value = e2;
              }
              return out;
            }
            Promise2.resolve = resolve2;
            function resolve2(value) {
              if (value instanceof this) {
                return value;
              }
              return handlers.resolve(new this(INTERNAL), value);
            }
            Promise2.reject = reject;
            function reject(reason) {
              var promise = new this(INTERNAL);
              return handlers.reject(promise, reason);
            }
            Promise2.all = all;
            function all(iterable) {
              var self2 = this;
              if (Object.prototype.toString.call(iterable) !== "[object Array]") {
                return this.reject(new TypeError("must be an array"));
              }
              var len = iterable.length;
              var called = false;
              if (!len) {
                return this.resolve([]);
              }
              var values = new Array(len);
              var resolved = 0;
              var i = -1;
              var promise = new this(INTERNAL);
              while (++i < len) {
                allResolver(iterable[i], i);
              }
              return promise;
              function allResolver(value, i2) {
                self2.resolve(value).then(resolveFromAll, function(error) {
                  if (!called) {
                    called = true;
                    handlers.reject(promise, error);
                  }
                });
                function resolveFromAll(outValue) {
                  values[i2] = outValue;
                  if (++resolved === len && !called) {
                    called = true;
                    handlers.resolve(promise, values);
                  }
                }
              }
            }
            Promise2.race = race;
            function race(iterable) {
              var self2 = this;
              if (Object.prototype.toString.call(iterable) !== "[object Array]") {
                return this.reject(new TypeError("must be an array"));
              }
              var len = iterable.length;
              var called = false;
              if (!len) {
                return this.resolve([]);
              }
              var i = -1;
              var promise = new this(INTERNAL);
              while (++i < len) {
                resolver(iterable[i]);
              }
              return promise;
              function resolver(value) {
                self2.resolve(value).then(function(response) {
                  if (!called) {
                    called = true;
                    handlers.resolve(promise, response);
                  }
                }, function(error) {
                  if (!called) {
                    called = true;
                    handlers.reject(promise, error);
                  }
                });
              }
            }
          }, { "1": 1 }], 3: [function(_dereq_, module2, exports2) {
            (function(global2) {
              if (typeof global2.Promise !== "function") {
                global2.Promise = _dereq_(2);
              }
            }).call(this, typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
          }, { "2": 2 }], 4: [function(_dereq_, module2, exports2) {
            var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
              return typeof obj;
            } : function(obj) {
              return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function getIDB() {
              try {
                if (typeof indexedDB !== "undefined") {
                  return indexedDB;
                }
                if (typeof webkitIndexedDB !== "undefined") {
                  return webkitIndexedDB;
                }
                if (typeof mozIndexedDB !== "undefined") {
                  return mozIndexedDB;
                }
                if (typeof OIndexedDB !== "undefined") {
                  return OIndexedDB;
                }
                if (typeof msIndexedDB !== "undefined") {
                  return msIndexedDB;
                }
              } catch (e2) {
                return;
              }
            }
            var idb = getIDB();
            function isIndexedDBValid() {
              try {
                if (!idb || !idb.open) {
                  return false;
                }
                var isSafari = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
                var hasFetch = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
                return (!isSafari || hasFetch) && typeof indexedDB !== "undefined" && // some outdated implementations of IDB that appear on Samsung
                // and HTC Android devices <4.4 are missing IDBKeyRange
                // See: https://github.com/mozilla/localForage/issues/128
                // See: https://github.com/mozilla/localForage/issues/272
                typeof IDBKeyRange !== "undefined";
              } catch (e2) {
                return false;
              }
            }
            function createBlob(parts, properties) {
              parts = parts || [];
              properties = properties || {};
              try {
                return new Blob(parts, properties);
              } catch (e2) {
                if (e2.name !== "TypeError") {
                  throw e2;
                }
                var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
                var builder = new Builder();
                for (var i = 0; i < parts.length; i += 1) {
                  builder.append(parts[i]);
                }
                return builder.getBlob(properties.type);
              }
            }
            if (typeof Promise === "undefined") {
              _dereq_(3);
            }
            var Promise$1 = Promise;
            function executeCallback(promise, callback) {
              if (callback) {
                promise.then(function(result) {
                  callback(null, result);
                }, function(error) {
                  callback(error);
                });
              }
            }
            function executeTwoCallbacks(promise, callback, errorCallback) {
              if (typeof callback === "function") {
                promise.then(callback);
              }
              if (typeof errorCallback === "function") {
                promise["catch"](errorCallback);
              }
            }
            function normalizeKey(key2) {
              if (typeof key2 !== "string") {
                console.warn(key2 + " used as a key, but it is not a string.");
                key2 = String(key2);
              }
              return key2;
            }
            function getCallback() {
              if (arguments.length && typeof arguments[arguments.length - 1] === "function") {
                return arguments[arguments.length - 1];
              }
            }
            var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
            var supportsBlobs = void 0;
            var dbContexts = {};
            var toString3 = Object.prototype.toString;
            var READ_ONLY = "readonly";
            var READ_WRITE = "readwrite";
            function _binStringToArrayBuffer(bin) {
              var length2 = bin.length;
              var buf = new ArrayBuffer(length2);
              var arr = new Uint8Array(buf);
              for (var i = 0; i < length2; i++) {
                arr[i] = bin.charCodeAt(i);
              }
              return buf;
            }
            function _checkBlobSupportWithoutCaching(idb2) {
              return new Promise$1(function(resolve2) {
                var txn = idb2.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
                var blob = createBlob([""]);
                txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
                txn.onabort = function(e2) {
                  e2.preventDefault();
                  e2.stopPropagation();
                  resolve2(false);
                };
                txn.oncomplete = function() {
                  var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
                  var matchedEdge = navigator.userAgent.match(/Edge\//);
                  resolve2(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
                };
              })["catch"](function() {
                return false;
              });
            }
            function _checkBlobSupport(idb2) {
              if (typeof supportsBlobs === "boolean") {
                return Promise$1.resolve(supportsBlobs);
              }
              return _checkBlobSupportWithoutCaching(idb2).then(function(value) {
                supportsBlobs = value;
                return supportsBlobs;
              });
            }
            function _deferReadiness(dbInfo) {
              var dbContext = dbContexts[dbInfo.name];
              var deferredOperation = {};
              deferredOperation.promise = new Promise$1(function(resolve2, reject) {
                deferredOperation.resolve = resolve2;
                deferredOperation.reject = reject;
              });
              dbContext.deferredOperations.push(deferredOperation);
              if (!dbContext.dbReady) {
                dbContext.dbReady = deferredOperation.promise;
              } else {
                dbContext.dbReady = dbContext.dbReady.then(function() {
                  return deferredOperation.promise;
                });
              }
            }
            function _advanceReadiness(dbInfo) {
              var dbContext = dbContexts[dbInfo.name];
              var deferredOperation = dbContext.deferredOperations.pop();
              if (deferredOperation) {
                deferredOperation.resolve();
                return deferredOperation.promise;
              }
            }
            function _rejectReadiness(dbInfo, err2) {
              var dbContext = dbContexts[dbInfo.name];
              var deferredOperation = dbContext.deferredOperations.pop();
              if (deferredOperation) {
                deferredOperation.reject(err2);
                return deferredOperation.promise;
              }
            }
            function _getConnection(dbInfo, upgradeNeeded) {
              return new Promise$1(function(resolve2, reject) {
                dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();
                if (dbInfo.db) {
                  if (upgradeNeeded) {
                    _deferReadiness(dbInfo);
                    dbInfo.db.close();
                  } else {
                    return resolve2(dbInfo.db);
                  }
                }
                var dbArgs = [dbInfo.name];
                if (upgradeNeeded) {
                  dbArgs.push(dbInfo.version);
                }
                var openreq = idb.open.apply(idb, dbArgs);
                if (upgradeNeeded) {
                  openreq.onupgradeneeded = function(e2) {
                    var db2 = openreq.result;
                    try {
                      db2.createObjectStore(dbInfo.storeName);
                      if (e2.oldVersion <= 1) {
                        db2.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                      }
                    } catch (ex) {
                      if (ex.name === "ConstraintError") {
                        console.warn('The database "' + dbInfo.name + '" has been upgraded from version ' + e2.oldVersion + " to version " + e2.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                      } else {
                        throw ex;
                      }
                    }
                  };
                }
                openreq.onerror = function(e2) {
                  e2.preventDefault();
                  reject(openreq.error);
                };
                openreq.onsuccess = function() {
                  var db2 = openreq.result;
                  db2.onversionchange = function(e2) {
                    e2.target.close();
                  };
                  resolve2(db2);
                  _advanceReadiness(dbInfo);
                };
              });
            }
            function _getOriginalConnection(dbInfo) {
              return _getConnection(dbInfo, false);
            }
            function _getUpgradedConnection(dbInfo) {
              return _getConnection(dbInfo, true);
            }
            function _isUpgradeNeeded(dbInfo, defaultVersion) {
              if (!dbInfo.db) {
                return true;
              }
              var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
              var isDowngrade = dbInfo.version < dbInfo.db.version;
              var isUpgrade = dbInfo.version > dbInfo.db.version;
              if (isDowngrade) {
                if (dbInfo.version !== defaultVersion) {
                  console.warn('The database "' + dbInfo.name + `" can't be downgraded from version ` + dbInfo.db.version + " to version " + dbInfo.version + ".");
                }
                dbInfo.version = dbInfo.db.version;
              }
              if (isUpgrade || isNewStore) {
                if (isNewStore) {
                  var incVersion = dbInfo.db.version + 1;
                  if (incVersion > dbInfo.version) {
                    dbInfo.version = incVersion;
                  }
                }
                return true;
              }
              return false;
            }
            function _encodeBlob(blob) {
              return new Promise$1(function(resolve2, reject) {
                var reader = new FileReader();
                reader.onerror = reject;
                reader.onloadend = function(e2) {
                  var base64 = btoa(e2.target.result || "");
                  resolve2({
                    __local_forage_encoded_blob: true,
                    data: base64,
                    type: blob.type
                  });
                };
                reader.readAsBinaryString(blob);
              });
            }
            function _decodeBlob(encodedBlob) {
              var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
              return createBlob([arrayBuff], { type: encodedBlob.type });
            }
            function _isEncodedBlob(value) {
              return value && value.__local_forage_encoded_blob;
            }
            function _fullyReady(callback) {
              var self2 = this;
              var promise = self2._initReady().then(function() {
                var dbContext = dbContexts[self2._dbInfo.name];
                if (dbContext && dbContext.dbReady) {
                  return dbContext.dbReady;
                }
              });
              executeTwoCallbacks(promise, callback, callback);
              return promise;
            }
            function _tryReconnect(dbInfo) {
              _deferReadiness(dbInfo);
              var dbContext = dbContexts[dbInfo.name];
              var forages = dbContext.forages;
              for (var i = 0; i < forages.length; i++) {
                var forage = forages[i];
                if (forage._dbInfo.db) {
                  forage._dbInfo.db.close();
                  forage._dbInfo.db = null;
                }
              }
              dbInfo.db = null;
              return _getOriginalConnection(dbInfo).then(function(db2) {
                dbInfo.db = db2;
                if (_isUpgradeNeeded(dbInfo)) {
                  return _getUpgradedConnection(dbInfo);
                }
                return db2;
              }).then(function(db2) {
                dbInfo.db = dbContext.db = db2;
                for (var i2 = 0; i2 < forages.length; i2++) {
                  forages[i2]._dbInfo.db = db2;
                }
              })["catch"](function(err2) {
                _rejectReadiness(dbInfo, err2);
                throw err2;
              });
            }
            function createTransaction(dbInfo, mode, callback, retries) {
              if (retries === void 0) {
                retries = 1;
              }
              try {
                var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
                callback(null, tx);
              } catch (err2) {
                if (retries > 0 && (!dbInfo.db || err2.name === "InvalidStateError" || err2.name === "NotFoundError")) {
                  return Promise$1.resolve().then(function() {
                    if (!dbInfo.db || err2.name === "NotFoundError" && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                      if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                      }
                      return _getUpgradedConnection(dbInfo);
                    }
                  }).then(function() {
                    return _tryReconnect(dbInfo).then(function() {
                      createTransaction(dbInfo, mode, callback, retries - 1);
                    });
                  })["catch"](callback);
                }
                callback(err2);
              }
            }
            function createDbContext() {
              return {
                // Running localForages sharing a database.
                forages: [],
                // Shared database.
                db: null,
                // Database readiness (promise).
                dbReady: null,
                // Deferred operations on the database.
                deferredOperations: []
              };
            }
            function _initStorage(options) {
              var self2 = this;
              var dbInfo = {
                db: null
              };
              if (options) {
                for (var i in options) {
                  dbInfo[i] = options[i];
                }
              }
              var dbContext = dbContexts[dbInfo.name];
              if (!dbContext) {
                dbContext = createDbContext();
                dbContexts[dbInfo.name] = dbContext;
              }
              dbContext.forages.push(self2);
              if (!self2._initReady) {
                self2._initReady = self2.ready;
                self2.ready = _fullyReady;
              }
              var initPromises = [];
              function ignoreErrors() {
                return Promise$1.resolve();
              }
              for (var j = 0; j < dbContext.forages.length; j++) {
                var forage = dbContext.forages[j];
                if (forage !== self2) {
                  initPromises.push(forage._initReady()["catch"](ignoreErrors));
                }
              }
              var forages = dbContext.forages.slice(0);
              return Promise$1.all(initPromises).then(function() {
                dbInfo.db = dbContext.db;
                return _getOriginalConnection(dbInfo);
              }).then(function(db2) {
                dbInfo.db = db2;
                if (_isUpgradeNeeded(dbInfo, self2._defaultConfig.version)) {
                  return _getUpgradedConnection(dbInfo);
                }
                return db2;
              }).then(function(db2) {
                dbInfo.db = dbContext.db = db2;
                self2._dbInfo = dbInfo;
                for (var k2 = 0; k2 < forages.length; k2++) {
                  var forage2 = forages[k2];
                  if (forage2 !== self2) {
                    forage2._dbInfo.db = dbInfo.db;
                    forage2._dbInfo.version = dbInfo.version;
                  }
                }
              });
            }
            function getItem(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_ONLY, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store.get(key2);
                      req.onsuccess = function() {
                        var value = req.result;
                        if (value === void 0) {
                          value = null;
                        }
                        if (_isEncodedBlob(value)) {
                          value = _decodeBlob(value);
                        }
                        resolve2(value);
                      };
                      req.onerror = function() {
                        reject(req.error);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function iterate(iterator, callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_ONLY, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store.openCursor();
                      var iterationNumber = 1;
                      req.onsuccess = function() {
                        var cursor = req.result;
                        if (cursor) {
                          var value = cursor.value;
                          if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                          }
                          var result = iterator(value, cursor.key, iterationNumber++);
                          if (result !== void 0) {
                            resolve2(result);
                          } else {
                            cursor["continue"]();
                          }
                        } else {
                          resolve2();
                        }
                      };
                      req.onerror = function() {
                        reject(req.error);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function setItem(key2, value, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                var dbInfo;
                self2.ready().then(function() {
                  dbInfo = self2._dbInfo;
                  if (toString3.call(value) === "[object Blob]") {
                    return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                      if (blobSupport) {
                        return value;
                      }
                      return _encodeBlob(value);
                    });
                  }
                  return value;
                }).then(function(value2) {
                  createTransaction(self2._dbInfo, READ_WRITE, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      if (value2 === null) {
                        value2 = void 0;
                      }
                      var req = store.put(value2, key2);
                      transaction.oncomplete = function() {
                        if (value2 === void 0) {
                          value2 = null;
                        }
                        resolve2(value2);
                      };
                      transaction.onabort = transaction.onerror = function() {
                        var err3 = req.error ? req.error : req.transaction.error;
                        reject(err3);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function removeItem(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_WRITE, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store["delete"](key2);
                      transaction.oncomplete = function() {
                        resolve2();
                      };
                      transaction.onerror = function() {
                        reject(req.error);
                      };
                      transaction.onabort = function() {
                        var err3 = req.error ? req.error : req.transaction.error;
                        reject(err3);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function clear(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_WRITE, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store.clear();
                      transaction.oncomplete = function() {
                        resolve2();
                      };
                      transaction.onabort = transaction.onerror = function() {
                        var err3 = req.error ? req.error : req.transaction.error;
                        reject(err3);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function length(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_ONLY, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store.count();
                      req.onsuccess = function() {
                        resolve2(req.result);
                      };
                      req.onerror = function() {
                        reject(req.error);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function key(n2, callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                if (n2 < 0) {
                  resolve2(null);
                  return;
                }
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_ONLY, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var advanced = false;
                      var req = store.openKeyCursor();
                      req.onsuccess = function() {
                        var cursor = req.result;
                        if (!cursor) {
                          resolve2(null);
                          return;
                        }
                        if (n2 === 0) {
                          resolve2(cursor.key);
                        } else {
                          if (!advanced) {
                            advanced = true;
                            cursor.advance(n2);
                          } else {
                            resolve2(cursor.key);
                          }
                        }
                      };
                      req.onerror = function() {
                        reject(req.error);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function keys(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  createTransaction(self2._dbInfo, READ_ONLY, function(err2, transaction) {
                    if (err2) {
                      return reject(err2);
                    }
                    try {
                      var store = transaction.objectStore(self2._dbInfo.storeName);
                      var req = store.openKeyCursor();
                      var keys2 = [];
                      req.onsuccess = function() {
                        var cursor = req.result;
                        if (!cursor) {
                          resolve2(keys2);
                          return;
                        }
                        keys2.push(cursor.key);
                        cursor["continue"]();
                      };
                      req.onerror = function() {
                        reject(req.error);
                      };
                    } catch (e2) {
                      reject(e2);
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function dropInstance(options, callback) {
              callback = getCallback.apply(this, arguments);
              var currentConfig = this.config();
              options = typeof options !== "function" && options || {};
              if (!options.name) {
                options.name = options.name || currentConfig.name;
                options.storeName = options.storeName || currentConfig.storeName;
              }
              var self2 = this;
              var promise;
              if (!options.name) {
                promise = Promise$1.reject("Invalid arguments");
              } else {
                var isCurrentDb = options.name === currentConfig.name && self2._dbInfo.db;
                var dbPromise = isCurrentDb ? Promise$1.resolve(self2._dbInfo.db) : _getOriginalConnection(options).then(function(db2) {
                  var dbContext = dbContexts[options.name];
                  var forages = dbContext.forages;
                  dbContext.db = db2;
                  for (var i = 0; i < forages.length; i++) {
                    forages[i]._dbInfo.db = db2;
                  }
                  return db2;
                });
                if (!options.storeName) {
                  promise = dbPromise.then(function(db2) {
                    _deferReadiness(options);
                    var dbContext = dbContexts[options.name];
                    var forages = dbContext.forages;
                    db2.close();
                    for (var i = 0; i < forages.length; i++) {
                      var forage = forages[i];
                      forage._dbInfo.db = null;
                    }
                    var dropDBPromise = new Promise$1(function(resolve2, reject) {
                      var req = idb.deleteDatabase(options.name);
                      req.onerror = function() {
                        var db3 = req.result;
                        if (db3) {
                          db3.close();
                        }
                        reject(req.error);
                      };
                      req.onblocked = function() {
                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                      };
                      req.onsuccess = function() {
                        var db3 = req.result;
                        if (db3) {
                          db3.close();
                        }
                        resolve2(db3);
                      };
                    });
                    return dropDBPromise.then(function(db3) {
                      dbContext.db = db3;
                      for (var i2 = 0; i2 < forages.length; i2++) {
                        var _forage = forages[i2];
                        _advanceReadiness(_forage._dbInfo);
                      }
                    })["catch"](function(err2) {
                      (_rejectReadiness(options, err2) || Promise$1.resolve())["catch"](function() {
                      });
                      throw err2;
                    });
                  });
                } else {
                  promise = dbPromise.then(function(db2) {
                    if (!db2.objectStoreNames.contains(options.storeName)) {
                      return;
                    }
                    var newVersion = db2.version + 1;
                    _deferReadiness(options);
                    var dbContext = dbContexts[options.name];
                    var forages = dbContext.forages;
                    db2.close();
                    for (var i = 0; i < forages.length; i++) {
                      var forage = forages[i];
                      forage._dbInfo.db = null;
                      forage._dbInfo.version = newVersion;
                    }
                    var dropObjectPromise = new Promise$1(function(resolve2, reject) {
                      var req = idb.open(options.name, newVersion);
                      req.onerror = function(err2) {
                        var db3 = req.result;
                        db3.close();
                        reject(err2);
                      };
                      req.onupgradeneeded = function() {
                        var db3 = req.result;
                        db3.deleteObjectStore(options.storeName);
                      };
                      req.onsuccess = function() {
                        var db3 = req.result;
                        db3.close();
                        resolve2(db3);
                      };
                    });
                    return dropObjectPromise.then(function(db3) {
                      dbContext.db = db3;
                      for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db3;
                        _advanceReadiness(_forage2._dbInfo);
                      }
                    })["catch"](function(err2) {
                      (_rejectReadiness(options, err2) || Promise$1.resolve())["catch"](function() {
                      });
                      throw err2;
                    });
                  });
                }
              }
              executeCallback(promise, callback);
              return promise;
            }
            var asyncStorage = {
              _driver: "asyncStorage",
              _initStorage,
              _support: isIndexedDBValid(),
              iterate,
              getItem,
              setItem,
              removeItem,
              clear,
              length,
              key,
              keys,
              dropInstance
            };
            function isWebSQLValid() {
              return typeof openDatabase === "function";
            }
            var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var BLOB_TYPE_PREFIX = "~~local_forage_type~";
            var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
            var SERIALIZED_MARKER = "__lfsc__:";
            var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
            var TYPE_ARRAYBUFFER = "arbf";
            var TYPE_BLOB = "blob";
            var TYPE_INT8ARRAY = "si08";
            var TYPE_UINT8ARRAY = "ui08";
            var TYPE_UINT8CLAMPEDARRAY = "uic8";
            var TYPE_INT16ARRAY = "si16";
            var TYPE_INT32ARRAY = "si32";
            var TYPE_UINT16ARRAY = "ur16";
            var TYPE_UINT32ARRAY = "ui32";
            var TYPE_FLOAT32ARRAY = "fl32";
            var TYPE_FLOAT64ARRAY = "fl64";
            var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
            var toString$1 = Object.prototype.toString;
            function stringToBuffer(serializedString) {
              var bufferLength = serializedString.length * 0.75;
              var len = serializedString.length;
              var i;
              var p2 = 0;
              var encoded1, encoded2, encoded3, encoded4;
              if (serializedString[serializedString.length - 1] === "=") {
                bufferLength--;
                if (serializedString[serializedString.length - 2] === "=") {
                  bufferLength--;
                }
              }
              var buffer = new ArrayBuffer(bufferLength);
              var bytes = new Uint8Array(buffer);
              for (i = 0; i < len; i += 4) {
                encoded1 = BASE_CHARS.indexOf(serializedString[i]);
                encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
                encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
                encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
                bytes[p2++] = encoded1 << 2 | encoded2 >> 4;
                bytes[p2++] = (encoded2 & 15) << 4 | encoded3 >> 2;
                bytes[p2++] = (encoded3 & 3) << 6 | encoded4 & 63;
              }
              return buffer;
            }
            function bufferToString(buffer) {
              var bytes = new Uint8Array(buffer);
              var base64String = "";
              var i;
              for (i = 0; i < bytes.length; i += 3) {
                base64String += BASE_CHARS[bytes[i] >> 2];
                base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
                base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
                base64String += BASE_CHARS[bytes[i + 2] & 63];
              }
              if (bytes.length % 3 === 2) {
                base64String = base64String.substring(0, base64String.length - 1) + "=";
              } else if (bytes.length % 3 === 1) {
                base64String = base64String.substring(0, base64String.length - 2) + "==";
              }
              return base64String;
            }
            function serialize(value, callback) {
              var valueType = "";
              if (value) {
                valueType = toString$1.call(value);
              }
              if (value && (valueType === "[object ArrayBuffer]" || value.buffer && toString$1.call(value.buffer) === "[object ArrayBuffer]")) {
                var buffer;
                var marker = SERIALIZED_MARKER;
                if (value instanceof ArrayBuffer) {
                  buffer = value;
                  marker += TYPE_ARRAYBUFFER;
                } else {
                  buffer = value.buffer;
                  if (valueType === "[object Int8Array]") {
                    marker += TYPE_INT8ARRAY;
                  } else if (valueType === "[object Uint8Array]") {
                    marker += TYPE_UINT8ARRAY;
                  } else if (valueType === "[object Uint8ClampedArray]") {
                    marker += TYPE_UINT8CLAMPEDARRAY;
                  } else if (valueType === "[object Int16Array]") {
                    marker += TYPE_INT16ARRAY;
                  } else if (valueType === "[object Uint16Array]") {
                    marker += TYPE_UINT16ARRAY;
                  } else if (valueType === "[object Int32Array]") {
                    marker += TYPE_INT32ARRAY;
                  } else if (valueType === "[object Uint32Array]") {
                    marker += TYPE_UINT32ARRAY;
                  } else if (valueType === "[object Float32Array]") {
                    marker += TYPE_FLOAT32ARRAY;
                  } else if (valueType === "[object Float64Array]") {
                    marker += TYPE_FLOAT64ARRAY;
                  } else {
                    callback(new Error("Failed to get type for BinaryArray"));
                  }
                }
                callback(marker + bufferToString(buffer));
              } else if (valueType === "[object Blob]") {
                var fileReader = new FileReader();
                fileReader.onload = function() {
                  var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
                  callback(SERIALIZED_MARKER + TYPE_BLOB + str);
                };
                fileReader.readAsArrayBuffer(value);
              } else {
                try {
                  callback(JSON.stringify(value));
                } catch (e2) {
                  console.error("Couldn't convert value into a JSON string: ", value);
                  callback(null, e2);
                }
              }
            }
            function deserialize(value) {
              if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
                return JSON.parse(value);
              }
              var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
              var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
              var blobType;
              if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
                var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
                blobType = matcher[1];
                serializedString = serializedString.substring(matcher[0].length);
              }
              var buffer = stringToBuffer(serializedString);
              switch (type) {
                case TYPE_ARRAYBUFFER:
                  return buffer;
                case TYPE_BLOB:
                  return createBlob([buffer], { type: blobType });
                case TYPE_INT8ARRAY:
                  return new Int8Array(buffer);
                case TYPE_UINT8ARRAY:
                  return new Uint8Array(buffer);
                case TYPE_UINT8CLAMPEDARRAY:
                  return new Uint8ClampedArray(buffer);
                case TYPE_INT16ARRAY:
                  return new Int16Array(buffer);
                case TYPE_UINT16ARRAY:
                  return new Uint16Array(buffer);
                case TYPE_INT32ARRAY:
                  return new Int32Array(buffer);
                case TYPE_UINT32ARRAY:
                  return new Uint32Array(buffer);
                case TYPE_FLOAT32ARRAY:
                  return new Float32Array(buffer);
                case TYPE_FLOAT64ARRAY:
                  return new Float64Array(buffer);
                default:
                  throw new Error("Unkown type: " + type);
              }
            }
            var localforageSerializer = {
              serialize,
              deserialize,
              stringToBuffer,
              bufferToString
            };
            function createDbTable(t2, dbInfo, callback, errorCallback) {
              t2.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], callback, errorCallback);
            }
            function _initStorage$1(options) {
              var self2 = this;
              var dbInfo = {
                db: null
              };
              if (options) {
                for (var i in options) {
                  dbInfo[i] = typeof options[i] !== "string" ? options[i].toString() : options[i];
                }
              }
              var dbInfoPromise = new Promise$1(function(resolve2, reject) {
                try {
                  dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
                } catch (e2) {
                  return reject(e2);
                }
                dbInfo.db.transaction(function(t2) {
                  createDbTable(t2, dbInfo, function() {
                    self2._dbInfo = dbInfo;
                    resolve2();
                  }, function(t3, error) {
                    reject(error);
                  });
                }, reject);
              });
              dbInfo.serializer = localforageSerializer;
              return dbInfoPromise;
            }
            function tryExecuteSql(t2, dbInfo, sqlStatement, args, callback, errorCallback) {
              t2.executeSql(sqlStatement, args, callback, function(t3, error) {
                if (error.code === error.SYNTAX_ERR) {
                  t3.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [dbInfo.storeName], function(t4, results) {
                    if (!results.rows.length) {
                      createDbTable(t4, dbInfo, function() {
                        t4.executeSql(sqlStatement, args, callback, errorCallback);
                      }, errorCallback);
                    } else {
                      errorCallback(t4, error);
                    }
                  }, errorCallback);
                } else {
                  errorCallback(t3, error);
                }
              }, errorCallback);
            }
            function getItem$1(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [key2], function(t3, results) {
                      var result = results.rows.length ? results.rows.item(0).value : null;
                      if (result) {
                        result = dbInfo.serializer.deserialize(result);
                      }
                      resolve2(result);
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function iterate$1(iterator, callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "SELECT * FROM " + dbInfo.storeName, [], function(t3, results) {
                      var rows = results.rows;
                      var length2 = rows.length;
                      for (var i = 0; i < length2; i++) {
                        var item = rows.item(i);
                        var result = item.value;
                        if (result) {
                          result = dbInfo.serializer.deserialize(result);
                        }
                        result = iterator(result, item.key, i + 1);
                        if (result !== void 0) {
                          resolve2(result);
                          return;
                        }
                      }
                      resolve2();
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function _setItem(key2, value, callback, retriesLeft) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  if (value === void 0) {
                    value = null;
                  }
                  var originalValue = value;
                  var dbInfo = self2._dbInfo;
                  dbInfo.serializer.serialize(value, function(value2, error) {
                    if (error) {
                      reject(error);
                    } else {
                      dbInfo.db.transaction(function(t2) {
                        tryExecuteSql(t2, dbInfo, "INSERT OR REPLACE INTO " + dbInfo.storeName + " (key, value) VALUES (?, ?)", [key2, value2], function() {
                          resolve2(originalValue);
                        }, function(t3, error2) {
                          reject(error2);
                        });
                      }, function(sqlError) {
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                          if (retriesLeft > 0) {
                            resolve2(_setItem.apply(self2, [key2, originalValue, callback, retriesLeft - 1]));
                            return;
                          }
                          reject(sqlError);
                        }
                      });
                    }
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function setItem$1(key2, value, callback) {
              return _setItem.apply(this, [key2, value, callback, 1]);
            }
            function removeItem$1(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [key2], function() {
                      resolve2();
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function clear$1(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "DELETE FROM " + dbInfo.storeName, [], function() {
                      resolve2();
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function length$1(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t3, results) {
                      var result = results.rows.item(0).c;
                      resolve2(result);
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function key$1(n2, callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [n2 + 1], function(t3, results) {
                      var result = results.rows.length ? results.rows.item(0).key : null;
                      resolve2(result);
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function keys$1(callback) {
              var self2 = this;
              var promise = new Promise$1(function(resolve2, reject) {
                self2.ready().then(function() {
                  var dbInfo = self2._dbInfo;
                  dbInfo.db.transaction(function(t2) {
                    tryExecuteSql(t2, dbInfo, "SELECT key FROM " + dbInfo.storeName, [], function(t3, results) {
                      var keys2 = [];
                      for (var i = 0; i < results.rows.length; i++) {
                        keys2.push(results.rows.item(i).key);
                      }
                      resolve2(keys2);
                    }, function(t3, error) {
                      reject(error);
                    });
                  });
                })["catch"](reject);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function getAllStoreNames(db2) {
              return new Promise$1(function(resolve2, reject) {
                db2.transaction(function(t2) {
                  t2.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(t3, results) {
                    var storeNames = [];
                    for (var i = 0; i < results.rows.length; i++) {
                      storeNames.push(results.rows.item(i).name);
                    }
                    resolve2({
                      db: db2,
                      storeNames
                    });
                  }, function(t3, error) {
                    reject(error);
                  });
                }, function(sqlError) {
                  reject(sqlError);
                });
              });
            }
            function dropInstance$1(options, callback) {
              callback = getCallback.apply(this, arguments);
              var currentConfig = this.config();
              options = typeof options !== "function" && options || {};
              if (!options.name) {
                options.name = options.name || currentConfig.name;
                options.storeName = options.storeName || currentConfig.storeName;
              }
              var self2 = this;
              var promise;
              if (!options.name) {
                promise = Promise$1.reject("Invalid arguments");
              } else {
                promise = new Promise$1(function(resolve2) {
                  var db2;
                  if (options.name === currentConfig.name) {
                    db2 = self2._dbInfo.db;
                  } else {
                    db2 = openDatabase(options.name, "", "", 0);
                  }
                  if (!options.storeName) {
                    resolve2(getAllStoreNames(db2));
                  } else {
                    resolve2({
                      db: db2,
                      storeNames: [options.storeName]
                    });
                  }
                }).then(function(operationInfo) {
                  return new Promise$1(function(resolve2, reject) {
                    operationInfo.db.transaction(function(t2) {
                      function dropTable(storeName) {
                        return new Promise$1(function(resolve3, reject2) {
                          t2.executeSql("DROP TABLE IF EXISTS " + storeName, [], function() {
                            resolve3();
                          }, function(t3, error) {
                            reject2(error);
                          });
                        });
                      }
                      var operations = [];
                      for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                      }
                      Promise$1.all(operations).then(function() {
                        resolve2();
                      })["catch"](function(e2) {
                        reject(e2);
                      });
                    }, function(sqlError) {
                      reject(sqlError);
                    });
                  });
                });
              }
              executeCallback(promise, callback);
              return promise;
            }
            var webSQLStorage = {
              _driver: "webSQLStorage",
              _initStorage: _initStorage$1,
              _support: isWebSQLValid(),
              iterate: iterate$1,
              getItem: getItem$1,
              setItem: setItem$1,
              removeItem: removeItem$1,
              clear: clear$1,
              length: length$1,
              key: key$1,
              keys: keys$1,
              dropInstance: dropInstance$1
            };
            function isLocalStorageValid() {
              try {
                return typeof localStorage !== "undefined" && "setItem" in localStorage && // in IE8 typeof localStorage.setItem === 'object'
                !!localStorage.setItem;
              } catch (e2) {
                return false;
              }
            }
            function _getKeyPrefix(options, defaultConfig) {
              var keyPrefix = options.name + "/";
              if (options.storeName !== defaultConfig.storeName) {
                keyPrefix += options.storeName + "/";
              }
              return keyPrefix;
            }
            function checkIfLocalStorageThrows() {
              var localStorageTestKey = "_localforage_support_test";
              try {
                localStorage.setItem(localStorageTestKey, true);
                localStorage.removeItem(localStorageTestKey);
                return false;
              } catch (e2) {
                return true;
              }
            }
            function _isLocalStorageUsable() {
              return !checkIfLocalStorageThrows() || localStorage.length > 0;
            }
            function _initStorage$2(options) {
              var self2 = this;
              var dbInfo = {};
              if (options) {
                for (var i in options) {
                  dbInfo[i] = options[i];
                }
              }
              dbInfo.keyPrefix = _getKeyPrefix(options, self2._defaultConfig);
              if (!_isLocalStorageUsable()) {
                return Promise$1.reject();
              }
              self2._dbInfo = dbInfo;
              dbInfo.serializer = localforageSerializer;
              return Promise$1.resolve();
            }
            function clear$2(callback) {
              var self2 = this;
              var promise = self2.ready().then(function() {
                var keyPrefix = self2._dbInfo.keyPrefix;
                for (var i = localStorage.length - 1; i >= 0; i--) {
                  var key2 = localStorage.key(i);
                  if (key2.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key2);
                  }
                }
              });
              executeCallback(promise, callback);
              return promise;
            }
            function getItem$2(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                var result = localStorage.getItem(dbInfo.keyPrefix + key2);
                if (result) {
                  result = dbInfo.serializer.deserialize(result);
                }
                return result;
              });
              executeCallback(promise, callback);
              return promise;
            }
            function iterate$2(iterator, callback) {
              var self2 = this;
              var promise = self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                var keyPrefix = dbInfo.keyPrefix;
                var keyPrefixLength = keyPrefix.length;
                var length2 = localStorage.length;
                var iterationNumber = 1;
                for (var i = 0; i < length2; i++) {
                  var key2 = localStorage.key(i);
                  if (key2.indexOf(keyPrefix) !== 0) {
                    continue;
                  }
                  var value = localStorage.getItem(key2);
                  if (value) {
                    value = dbInfo.serializer.deserialize(value);
                  }
                  value = iterator(value, key2.substring(keyPrefixLength), iterationNumber++);
                  if (value !== void 0) {
                    return value;
                  }
                }
              });
              executeCallback(promise, callback);
              return promise;
            }
            function key$2(n2, callback) {
              var self2 = this;
              var promise = self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                var result;
                try {
                  result = localStorage.key(n2);
                } catch (error) {
                  result = null;
                }
                if (result) {
                  result = result.substring(dbInfo.keyPrefix.length);
                }
                return result;
              });
              executeCallback(promise, callback);
              return promise;
            }
            function keys$2(callback) {
              var self2 = this;
              var promise = self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                var length2 = localStorage.length;
                var keys2 = [];
                for (var i = 0; i < length2; i++) {
                  var itemKey = localStorage.key(i);
                  if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                    keys2.push(itemKey.substring(dbInfo.keyPrefix.length));
                  }
                }
                return keys2;
              });
              executeCallback(promise, callback);
              return promise;
            }
            function length$2(callback) {
              var self2 = this;
              var promise = self2.keys().then(function(keys2) {
                return keys2.length;
              });
              executeCallback(promise, callback);
              return promise;
            }
            function removeItem$2(key2, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                localStorage.removeItem(dbInfo.keyPrefix + key2);
              });
              executeCallback(promise, callback);
              return promise;
            }
            function setItem$2(key2, value, callback) {
              var self2 = this;
              key2 = normalizeKey(key2);
              var promise = self2.ready().then(function() {
                if (value === void 0) {
                  value = null;
                }
                var originalValue = value;
                return new Promise$1(function(resolve2, reject) {
                  var dbInfo = self2._dbInfo;
                  dbInfo.serializer.serialize(value, function(value2, error) {
                    if (error) {
                      reject(error);
                    } else {
                      try {
                        localStorage.setItem(dbInfo.keyPrefix + key2, value2);
                        resolve2(originalValue);
                      } catch (e2) {
                        if (e2.name === "QuotaExceededError" || e2.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                          reject(e2);
                        }
                        reject(e2);
                      }
                    }
                  });
                });
              });
              executeCallback(promise, callback);
              return promise;
            }
            function dropInstance$2(options, callback) {
              callback = getCallback.apply(this, arguments);
              options = typeof options !== "function" && options || {};
              if (!options.name) {
                var currentConfig = this.config();
                options.name = options.name || currentConfig.name;
                options.storeName = options.storeName || currentConfig.storeName;
              }
              var self2 = this;
              var promise;
              if (!options.name) {
                promise = Promise$1.reject("Invalid arguments");
              } else {
                promise = new Promise$1(function(resolve2) {
                  if (!options.storeName) {
                    resolve2(options.name + "/");
                  } else {
                    resolve2(_getKeyPrefix(options, self2._defaultConfig));
                  }
                }).then(function(keyPrefix) {
                  for (var i = localStorage.length - 1; i >= 0; i--) {
                    var key2 = localStorage.key(i);
                    if (key2.indexOf(keyPrefix) === 0) {
                      localStorage.removeItem(key2);
                    }
                  }
                });
              }
              executeCallback(promise, callback);
              return promise;
            }
            var localStorageWrapper = {
              _driver: "localStorageWrapper",
              _initStorage: _initStorage$2,
              _support: isLocalStorageValid(),
              iterate: iterate$2,
              getItem: getItem$2,
              setItem: setItem$2,
              removeItem: removeItem$2,
              clear: clear$2,
              length: length$2,
              key: key$2,
              keys: keys$2,
              dropInstance: dropInstance$2
            };
            var sameValue = function sameValue2(x, y2) {
              return x === y2 || typeof x === "number" && typeof y2 === "number" && isNaN(x) && isNaN(y2);
            };
            var includes2 = function includes3(array, searchElement) {
              var len = array.length;
              var i = 0;
              while (i < len) {
                if (sameValue(array[i], searchElement)) {
                  return true;
                }
                i++;
              }
              return false;
            };
            var isArray2 = Array.isArray || function(arg) {
              return Object.prototype.toString.call(arg) === "[object Array]";
            };
            var DefinedDrivers = {};
            var DriverSupport = {};
            var DefaultDrivers = {
              INDEXEDDB: asyncStorage,
              WEBSQL: webSQLStorage,
              LOCALSTORAGE: localStorageWrapper
            };
            var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
            var OptionalDriverMethods = ["dropInstance"];
            var LibraryMethods = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(OptionalDriverMethods);
            var DefaultConfig = {
              description: "",
              driver: DefaultDriverOrder.slice(),
              name: "localforage",
              // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
              // we can use without a prompt.
              size: 4980736,
              storeName: "keyvaluepairs",
              version: 1
            };
            function callWhenReady(localForageInstance, libraryMethod) {
              localForageInstance[libraryMethod] = function() {
                var _args = arguments;
                return localForageInstance.ready().then(function() {
                  return localForageInstance[libraryMethod].apply(localForageInstance, _args);
                });
              };
            }
            function extend() {
              for (var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                if (arg) {
                  for (var _key in arg) {
                    if (arg.hasOwnProperty(_key)) {
                      if (isArray2(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                      } else {
                        arguments[0][_key] = arg[_key];
                      }
                    }
                  }
                }
              }
              return arguments[0];
            }
            var LocalForage = (function() {
              function LocalForage2(options) {
                _classCallCheck(this, LocalForage2);
                for (var driverTypeKey in DefaultDrivers) {
                  if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                    var driver = DefaultDrivers[driverTypeKey];
                    var driverName = driver._driver;
                    this[driverTypeKey] = driverName;
                    if (!DefinedDrivers[driverName]) {
                      this.defineDriver(driver);
                    }
                  }
                }
                this._defaultConfig = extend({}, DefaultConfig);
                this._config = extend({}, this._defaultConfig, options);
                this._driverSet = null;
                this._initDriver = null;
                this._ready = false;
                this._dbInfo = null;
                this._wrapLibraryMethodsWithReady();
                this.setDriver(this._config.driver)["catch"](function() {
                });
              }
              LocalForage2.prototype.config = function config2(options) {
                if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
                  if (this._ready) {
                    return new Error("Can't call config() after localforage has been used.");
                  }
                  for (var i in options) {
                    if (i === "storeName") {
                      options[i] = options[i].replace(/\W/g, "_");
                    }
                    if (i === "version" && typeof options[i] !== "number") {
                      return new Error("Database version must be a number.");
                    }
                    this._config[i] = options[i];
                  }
                  if ("driver" in options && options.driver) {
                    return this.setDriver(this._config.driver);
                  }
                  return true;
                } else if (typeof options === "string") {
                  return this._config[options];
                } else {
                  return this._config;
                }
              };
              LocalForage2.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
                var promise = new Promise$1(function(resolve2, reject) {
                  try {
                    var driverName = driverObject._driver;
                    var complianceError = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                    if (!driverObject._driver) {
                      reject(complianceError);
                      return;
                    }
                    var driverMethods = LibraryMethods.concat("_initStorage");
                    for (var i = 0, len = driverMethods.length; i < len; i++) {
                      var driverMethodName = driverMethods[i];
                      var isRequired = !includes2(OptionalDriverMethods, driverMethodName);
                      if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== "function") {
                        reject(complianceError);
                        return;
                      }
                    }
                    var configureMissingMethods = function configureMissingMethods2() {
                      var methodNotImplementedFactory = function methodNotImplementedFactory2(methodName) {
                        return function() {
                          var error = new Error("Method " + methodName + " is not implemented by the current driver");
                          var promise2 = Promise$1.reject(error);
                          executeCallback(promise2, arguments[arguments.length - 1]);
                          return promise2;
                        };
                      };
                      for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                          driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                      }
                    };
                    configureMissingMethods();
                    var setDriverSupport = function setDriverSupport2(support) {
                      if (DefinedDrivers[driverName]) {
                        console.info("Redefining LocalForage driver: " + driverName);
                      }
                      DefinedDrivers[driverName] = driverObject;
                      DriverSupport[driverName] = support;
                      resolve2();
                    };
                    if ("_support" in driverObject) {
                      if (driverObject._support && typeof driverObject._support === "function") {
                        driverObject._support().then(setDriverSupport, reject);
                      } else {
                        setDriverSupport(!!driverObject._support);
                      }
                    } else {
                      setDriverSupport(true);
                    }
                  } catch (e2) {
                    reject(e2);
                  }
                });
                executeTwoCallbacks(promise, callback, errorCallback);
                return promise;
              };
              LocalForage2.prototype.driver = function driver() {
                return this._driver || null;
              };
              LocalForage2.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
                var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error("Driver not found."));
                executeTwoCallbacks(getDriverPromise, callback, errorCallback);
                return getDriverPromise;
              };
              LocalForage2.prototype.getSerializer = function getSerializer(callback) {
                var serializerPromise = Promise$1.resolve(localforageSerializer);
                executeTwoCallbacks(serializerPromise, callback);
                return serializerPromise;
              };
              LocalForage2.prototype.ready = function ready(callback) {
                var self2 = this;
                var promise = self2._driverSet.then(function() {
                  if (self2._ready === null) {
                    self2._ready = self2._initDriver();
                  }
                  return self2._ready;
                });
                executeTwoCallbacks(promise, callback, callback);
                return promise;
              };
              LocalForage2.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
                var self2 = this;
                if (!isArray2(drivers)) {
                  drivers = [drivers];
                }
                var supportedDrivers = this._getSupportedDrivers(drivers);
                function setDriverToConfig() {
                  self2._config.driver = self2.driver();
                }
                function extendSelfWithDriver(driver) {
                  self2._extend(driver);
                  setDriverToConfig();
                  self2._ready = self2._initStorage(self2._config);
                  return self2._ready;
                }
                function initDriver(supportedDrivers2) {
                  return function() {
                    var currentDriverIndex = 0;
                    function driverPromiseLoop() {
                      while (currentDriverIndex < supportedDrivers2.length) {
                        var driverName = supportedDrivers2[currentDriverIndex];
                        currentDriverIndex++;
                        self2._dbInfo = null;
                        self2._ready = null;
                        return self2.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                      }
                      setDriverToConfig();
                      var error = new Error("No available storage method found.");
                      self2._driverSet = Promise$1.reject(error);
                      return self2._driverSet;
                    }
                    return driverPromiseLoop();
                  };
                }
                var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
                  return Promise$1.resolve();
                }) : Promise$1.resolve();
                this._driverSet = oldDriverSetDone.then(function() {
                  var driverName = supportedDrivers[0];
                  self2._dbInfo = null;
                  self2._ready = null;
                  return self2.getDriver(driverName).then(function(driver) {
                    self2._driver = driver._driver;
                    setDriverToConfig();
                    self2._wrapLibraryMethodsWithReady();
                    self2._initDriver = initDriver(supportedDrivers);
                  });
                })["catch"](function() {
                  setDriverToConfig();
                  var error = new Error("No available storage method found.");
                  self2._driverSet = Promise$1.reject(error);
                  return self2._driverSet;
                });
                executeTwoCallbacks(this._driverSet, callback, errorCallback);
                return this._driverSet;
              };
              LocalForage2.prototype.supports = function supports(driverName) {
                return !!DriverSupport[driverName];
              };
              LocalForage2.prototype._extend = function _extend(libraryMethodsAndProperties) {
                extend(this, libraryMethodsAndProperties);
              };
              LocalForage2.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
                var supportedDrivers = [];
                for (var i = 0, len = drivers.length; i < len; i++) {
                  var driverName = drivers[i];
                  if (this.supports(driverName)) {
                    supportedDrivers.push(driverName);
                  }
                }
                return supportedDrivers;
              };
              LocalForage2.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
                for (var i = 0, len = LibraryMethods.length; i < len; i++) {
                  callWhenReady(this, LibraryMethods[i]);
                }
              };
              LocalForage2.prototype.createInstance = function createInstance(options) {
                return new LocalForage2(options);
              };
              return LocalForage2;
            })();
            var localforage_js = new LocalForage();
            module2.exports = localforage_js;
          }, { "3": 3 }] }, {}, [4])(4);
        });
      })(localforage);
      localForage = localforage.exports;
      jszip_min = { exports: {} };
      (function(module, exports) {
        !(function(e2) {
          module.exports = e2();
        })(function() {
          return (function s2(a2, o2, h3) {
            function u2(r, e3) {
              if (!o2[r]) {
                if (!a2[r]) {
                  var t2 = "function" == typeof commonjsRequire && commonjsRequire;
                  if (!e3 && t2) return t2(r, true);
                  if (l2) return l2(r, true);
                  var n2 = new Error("Cannot find module '" + r + "'");
                  throw n2.code = "MODULE_NOT_FOUND", n2;
                }
                var i = o2[r] = { exports: {} };
                a2[r][0].call(i.exports, function(e4) {
                  var t3 = a2[r][1][e4];
                  return u2(t3 || e4);
                }, i, i.exports, s2, a2, o2, h3);
              }
              return o2[r].exports;
            }
            for (var l2 = "function" == typeof commonjsRequire && commonjsRequire, e2 = 0; e2 < h3.length; e2++) u2(h3[e2]);
            return u2;
          })({ 1: [function(e2, t2, r) {
            var d2 = e2("./utils"), c2 = e2("./support"), p2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            r.encode = function(e3) {
              for (var t3, r2, n2, i, s2, a2, o2, h3 = [], u2 = 0, l2 = e3.length, f2 = l2, c3 = "string" !== d2.getTypeOf(e3); u2 < e3.length; ) f2 = l2 - u2, n2 = c3 ? (t3 = e3[u2++], r2 = u2 < l2 ? e3[u2++] : 0, u2 < l2 ? e3[u2++] : 0) : (t3 = e3.charCodeAt(u2++), r2 = u2 < l2 ? e3.charCodeAt(u2++) : 0, u2 < l2 ? e3.charCodeAt(u2++) : 0), i = t3 >> 2, s2 = (3 & t3) << 4 | r2 >> 4, a2 = 1 < f2 ? (15 & r2) << 2 | n2 >> 6 : 64, o2 = 2 < f2 ? 63 & n2 : 64, h3.push(p2.charAt(i) + p2.charAt(s2) + p2.charAt(a2) + p2.charAt(o2));
              return h3.join("");
            }, r.decode = function(e3) {
              var t3, r2, n2, i, s2, a2, o2 = 0, h3 = 0, u2 = "data:";
              if (e3.substr(0, u2.length) === u2) throw new Error("Invalid base64 input, it looks like a data url.");
              var l2, f2 = 3 * (e3 = e3.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
              if (e3.charAt(e3.length - 1) === p2.charAt(64) && f2--, e3.charAt(e3.length - 2) === p2.charAt(64) && f2--, f2 % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
              for (l2 = c2.uint8array ? new Uint8Array(0 | f2) : new Array(0 | f2); o2 < e3.length; ) t3 = p2.indexOf(e3.charAt(o2++)) << 2 | (i = p2.indexOf(e3.charAt(o2++))) >> 4, r2 = (15 & i) << 4 | (s2 = p2.indexOf(e3.charAt(o2++))) >> 2, n2 = (3 & s2) << 6 | (a2 = p2.indexOf(e3.charAt(o2++))), l2[h3++] = t3, 64 !== s2 && (l2[h3++] = r2), 64 !== a2 && (l2[h3++] = n2);
              return l2;
            };
          }, { "./support": 30, "./utils": 32 }], 2: [function(e2, t2, r) {
            var n2 = e2("./external"), i = e2("./stream/DataWorker"), s2 = e2("./stream/Crc32Probe"), a2 = e2("./stream/DataLengthProbe");
            function o2(e3, t3, r2, n3, i2) {
              this.compressedSize = e3, this.uncompressedSize = t3, this.crc32 = r2, this.compression = n3, this.compressedContent = i2;
            }
            o2.prototype = { getContentWorker: function() {
              var e3 = new i(n2.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a2("data_length")), t3 = this;
              return e3.on("end", function() {
                if (this.streamInfo.data_length !== t3.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
              }), e3;
            }, getCompressedWorker: function() {
              return new i(n2.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
            } }, o2.createWorkerFrom = function(e3, t3, r2) {
              return e3.pipe(new s2()).pipe(new a2("uncompressedSize")).pipe(t3.compressWorker(r2)).pipe(new a2("compressedSize")).withStreamInfo("compression", t3);
            }, t2.exports = o2;
          }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e2, t2, r) {
            var n2 = e2("./stream/GenericWorker");
            r.STORE = { magic: "\0\0", compressWorker: function() {
              return new n2("STORE compression");
            }, uncompressWorker: function() {
              return new n2("STORE decompression");
            } }, r.DEFLATE = e2("./flate");
          }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e2, t2, r) {
            var n2 = e2("./utils");
            var o2 = (function() {
              for (var e3, t3 = [], r2 = 0; r2 < 256; r2++) {
                e3 = r2;
                for (var n3 = 0; n3 < 8; n3++) e3 = 1 & e3 ? 3988292384 ^ e3 >>> 1 : e3 >>> 1;
                t3[r2] = e3;
              }
              return t3;
            })();
            t2.exports = function(e3, t3) {
              return void 0 !== e3 && e3.length ? "string" !== n2.getTypeOf(e3) ? (function(e4, t4, r2, n3) {
                var i = o2, s2 = n3 + r2;
                e4 ^= -1;
                for (var a2 = n3; a2 < s2; a2++) e4 = e4 >>> 8 ^ i[255 & (e4 ^ t4[a2])];
                return -1 ^ e4;
              })(0 | t3, e3, e3.length, 0) : (function(e4, t4, r2, n3) {
                var i = o2, s2 = n3 + r2;
                e4 ^= -1;
                for (var a2 = n3; a2 < s2; a2++) e4 = e4 >>> 8 ^ i[255 & (e4 ^ t4.charCodeAt(a2))];
                return -1 ^ e4;
              })(0 | t3, e3, e3.length, 0) : 0;
            };
          }, { "./utils": 32 }], 5: [function(e2, t2, r) {
            r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
          }, {}], 6: [function(e2, t2, r) {
            var n2 = null;
            n2 = "undefined" != typeof Promise ? Promise : e2("lie"), t2.exports = { Promise: n2 };
          }, { lie: 37 }], 7: [function(e2, t2, r) {
            var n2 = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e2("pako"), s2 = e2("./utils"), a2 = e2("./stream/GenericWorker"), o2 = n2 ? "uint8array" : "array";
            function h3(e3, t3) {
              a2.call(this, "FlateWorker/" + e3), this._pako = null, this._pakoAction = e3, this._pakoOptions = t3, this.meta = {};
            }
            r.magic = "\b\0", s2.inherits(h3, a2), h3.prototype.processChunk = function(e3) {
              this.meta = e3.meta, null === this._pako && this._createPako(), this._pako.push(s2.transformTo(o2, e3.data), false);
            }, h3.prototype.flush = function() {
              a2.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
            }, h3.prototype.cleanUp = function() {
              a2.prototype.cleanUp.call(this), this._pako = null;
            }, h3.prototype._createPako = function() {
              this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
              var t3 = this;
              this._pako.onData = function(e3) {
                t3.push({ data: e3, meta: t3.meta });
              };
            }, r.compressWorker = function(e3) {
              return new h3("Deflate", e3);
            }, r.uncompressWorker = function() {
              return new h3("Inflate", {});
            };
          }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e2, t2, r) {
            function A(e3, t3) {
              var r2, n3 = "";
              for (r2 = 0; r2 < t3; r2++) n3 += String.fromCharCode(255 & e3), e3 >>>= 8;
              return n3;
            }
            function n2(e3, t3, r2, n3, i2, s3) {
              var a2, o2, h3 = e3.file, u2 = e3.compression, l2 = s3 !== O.utf8encode, f2 = I.transformTo("string", s3(h3.name)), c2 = I.transformTo("string", O.utf8encode(h3.name)), d2 = h3.comment, p2 = I.transformTo("string", s3(d2)), m2 = I.transformTo("string", O.utf8encode(d2)), _ = c2.length !== h3.name.length, g = m2.length !== d2.length, b2 = "", v3 = "", y2 = "", w2 = h3.dir, k2 = h3.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
              t3 && !r2 || (x.crc32 = e3.crc32, x.compressedSize = e3.compressedSize, x.uncompressedSize = e3.uncompressedSize);
              var S = 0;
              t3 && (S |= 8), l2 || !_ && !g || (S |= 2048);
              var z = 0, C = 0;
              w2 && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e4, t4) {
                var r3 = e4;
                return e4 || (r3 = t4 ? 16893 : 33204), (65535 & r3) << 16;
              })(h3.unixPermissions, w2)) : (C = 20, z |= (function(e4) {
                return 63 & (e4 || 0);
              })(h3.dosPermissions)), a2 = k2.getUTCHours(), a2 <<= 6, a2 |= k2.getUTCMinutes(), a2 <<= 5, a2 |= k2.getUTCSeconds() / 2, o2 = k2.getUTCFullYear() - 1980, o2 <<= 4, o2 |= k2.getUTCMonth() + 1, o2 <<= 5, o2 |= k2.getUTCDate(), _ && (v3 = A(1, 1) + A(B(f2), 4) + c2, b2 += "up" + A(v3.length, 2) + v3), g && (y2 = A(1, 1) + A(B(p2), 4) + m2, b2 += "uc" + A(y2.length, 2) + y2);
              var E = "";
              return E += "\n\0", E += A(S, 2), E += u2.magic, E += A(a2, 2), E += A(o2, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f2.length, 2), E += A(b2.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f2 + b2, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p2.length, 2) + "\0\0\0\0" + A(z, 4) + A(n3, 4) + f2 + b2 + p2 };
            }
            var I = e2("../utils"), i = e2("../stream/GenericWorker"), O = e2("../utf8"), B = e2("../crc32"), R = e2("../signature");
            function s2(e3, t3, r2, n3) {
              i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t3, this.zipPlatform = r2, this.encodeFileName = n3, this.streamFiles = e3, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
            }
            I.inherits(s2, i), s2.prototype.push = function(e3) {
              var t3 = e3.meta.percent || 0, r2 = this.entriesCount, n3 = this._sources.length;
              this.accumulate ? this.contentBuffer.push(e3) : (this.bytesWritten += e3.data.length, i.prototype.push.call(this, { data: e3.data, meta: { currentFile: this.currentFile, percent: r2 ? (t3 + 100 * (r2 - n3 - 1)) / r2 : 100 } }));
            }, s2.prototype.openedSource = function(e3) {
              this.currentSourceOffset = this.bytesWritten, this.currentFile = e3.file.name;
              var t3 = this.streamFiles && !e3.file.dir;
              if (t3) {
                var r2 = n2(e3, t3, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                this.push({ data: r2.fileRecord, meta: { percent: 0 } });
              } else this.accumulate = true;
            }, s2.prototype.closedSource = function(e3) {
              this.accumulate = false;
              var t3 = this.streamFiles && !e3.file.dir, r2 = n2(e3, t3, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
              if (this.dirRecords.push(r2.dirRecord), t3) this.push({ data: (function(e4) {
                return R.DATA_DESCRIPTOR + A(e4.crc32, 4) + A(e4.compressedSize, 4) + A(e4.uncompressedSize, 4);
              })(e3), meta: { percent: 100 } });
              else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
              this.currentFile = null;
            }, s2.prototype.flush = function() {
              for (var e3 = this.bytesWritten, t3 = 0; t3 < this.dirRecords.length; t3++) this.push({ data: this.dirRecords[t3], meta: { percent: 100 } });
              var r2 = this.bytesWritten - e3, n3 = (function(e4, t4, r3, n4, i2) {
                var s3 = I.transformTo("string", i2(n4));
                return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e4, 2) + A(e4, 2) + A(t4, 4) + A(r3, 4) + A(s3.length, 2) + s3;
              })(this.dirRecords.length, r2, e3, this.zipComment, this.encodeFileName);
              this.push({ data: n3, meta: { percent: 100 } });
            }, s2.prototype.prepareNextSource = function() {
              this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
            }, s2.prototype.registerPrevious = function(e3) {
              this._sources.push(e3);
              var t3 = this;
              return e3.on("data", function(e4) {
                t3.processChunk(e4);
              }), e3.on("end", function() {
                t3.closedSource(t3.previous.streamInfo), t3._sources.length ? t3.prepareNextSource() : t3.end();
              }), e3.on("error", function(e4) {
                t3.error(e4);
              }), this;
            }, s2.prototype.resume = function() {
              return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
            }, s2.prototype.error = function(e3) {
              var t3 = this._sources;
              if (!i.prototype.error.call(this, e3)) return false;
              for (var r2 = 0; r2 < t3.length; r2++) try {
                t3[r2].error(e3);
              } catch (e4) {
              }
              return true;
            }, s2.prototype.lock = function() {
              i.prototype.lock.call(this);
              for (var e3 = this._sources, t3 = 0; t3 < e3.length; t3++) e3[t3].lock();
            }, t2.exports = s2;
          }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e2, t2, r) {
            var u2 = e2("../compressions"), n2 = e2("./ZipFileWorker");
            r.generateWorker = function(e3, a2, t3) {
              var o2 = new n2(a2.streamFiles, t3, a2.platform, a2.encodeFileName), h3 = 0;
              try {
                e3.forEach(function(e4, t4) {
                  h3++;
                  var r2 = (function(e5, t5) {
                    var r3 = e5 || t5, n4 = u2[r3];
                    if (!n4) throw new Error(r3 + " is not a valid compression method !");
                    return n4;
                  })(t4.options.compression, a2.compression), n3 = t4.options.compressionOptions || a2.compressionOptions || {}, i = t4.dir, s2 = t4.date;
                  t4._compressWorker(r2, n3).withStreamInfo("file", { name: e4, dir: i, date: s2, comment: t4.comment || "", unixPermissions: t4.unixPermissions, dosPermissions: t4.dosPermissions }).pipe(o2);
                }), o2.entriesCount = h3;
              } catch (e4) {
                o2.error(e4);
              }
              return o2;
            };
          }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e2, t2, r) {
            function n2() {
              if (!(this instanceof n2)) return new n2();
              if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
              this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
                var e3 = new n2();
                for (var t3 in this) "function" != typeof this[t3] && (e3[t3] = this[t3]);
                return e3;
              };
            }
            (n2.prototype = e2("./object")).loadAsync = e2("./load"), n2.support = e2("./support"), n2.defaults = e2("./defaults"), n2.version = "3.10.1", n2.loadAsync = function(e3, t3) {
              return new n2().loadAsync(e3, t3);
            }, n2.external = e2("./external"), t2.exports = n2;
          }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e2, t2, r) {
            var u2 = e2("./utils"), i = e2("./external"), n2 = e2("./utf8"), s2 = e2("./zipEntries"), a2 = e2("./stream/Crc32Probe"), l2 = e2("./nodejsUtils");
            function f2(n3) {
              return new i.Promise(function(e3, t3) {
                var r2 = n3.decompressed.getContentWorker().pipe(new a2());
                r2.on("error", function(e4) {
                  t3(e4);
                }).on("end", function() {
                  r2.streamInfo.crc32 !== n3.decompressed.crc32 ? t3(new Error("Corrupted zip : CRC32 mismatch")) : e3();
                }).resume();
              });
            }
            t2.exports = function(e3, o2) {
              var h3 = this;
              return o2 = u2.extend(o2 || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n2.utf8decode }), l2.isNode && l2.isStream(e3) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u2.prepareContent("the loaded zip file", e3, true, o2.optimizedBinaryString, o2.base64).then(function(e4) {
                var t3 = new s2(o2);
                return t3.load(e4), t3;
              }).then(function(e4) {
                var t3 = [i.Promise.resolve(e4)], r2 = e4.files;
                if (o2.checkCRC32) for (var n3 = 0; n3 < r2.length; n3++) t3.push(f2(r2[n3]));
                return i.Promise.all(t3);
              }).then(function(e4) {
                for (var t3 = e4.shift(), r2 = t3.files, n3 = 0; n3 < r2.length; n3++) {
                  var i2 = r2[n3], s3 = i2.fileNameStr, a3 = u2.resolve(i2.fileNameStr);
                  h3.file(a3, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o2.createFolders }), i2.dir || (h3.file(a3).unsafeOriginalName = s3);
                }
                return t3.zipComment.length && (h3.comment = t3.zipComment), h3;
              });
            };
          }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e2, t2, r) {
            var n2 = e2("../utils"), i = e2("../stream/GenericWorker");
            function s2(e3, t3) {
              i.call(this, "Nodejs stream input adapter for " + e3), this._upstreamEnded = false, this._bindStream(t3);
            }
            n2.inherits(s2, i), s2.prototype._bindStream = function(e3) {
              var t3 = this;
              (this._stream = e3).pause(), e3.on("data", function(e4) {
                t3.push({ data: e4, meta: { percent: 0 } });
              }).on("error", function(e4) {
                t3.isPaused ? this.generatedError = e4 : t3.error(e4);
              }).on("end", function() {
                t3.isPaused ? t3._upstreamEnded = true : t3.end();
              });
            }, s2.prototype.pause = function() {
              return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
            }, s2.prototype.resume = function() {
              return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
            }, t2.exports = s2;
          }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e2, t2, r) {
            var i = e2("readable-stream").Readable;
            function n2(e3, t3, r2) {
              i.call(this, t3), this._helper = e3;
              var n3 = this;
              e3.on("data", function(e4, t4) {
                n3.push(e4) || n3._helper.pause(), r2 && r2(t4);
              }).on("error", function(e4) {
                n3.emit("error", e4);
              }).on("end", function() {
                n3.push(null);
              });
            }
            e2("../utils").inherits(n2, i), n2.prototype._read = function() {
              this._helper.resume();
            }, t2.exports = n2;
          }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e2, t2, r) {
            t2.exports = { isNode: "undefined" != typeof Buffer2, newBufferFrom: function(e3, t3) {
              if (Buffer2.from && Buffer2.from !== Uint8Array.from) return Buffer2.from(e3, t3);
              if ("number" == typeof e3) throw new Error('The "data" argument must not be a number');
              return new Buffer2(e3, t3);
            }, allocBuffer: function(e3) {
              if (Buffer2.alloc) return Buffer2.alloc(e3);
              var t3 = new Buffer2(e3);
              return t3.fill(0), t3;
            }, isBuffer: function(e3) {
              return Buffer2.isBuffer(e3);
            }, isStream: function(e3) {
              return e3 && "function" == typeof e3.on && "function" == typeof e3.pause && "function" == typeof e3.resume;
            } };
          }, {}], 15: [function(e2, t2, r) {
            function s2(e3, t3, r2) {
              var n3, i2 = u2.getTypeOf(t3), s3 = u2.extend(r2 || {}, f2);
              s3.date = s3.date || /* @__PURE__ */ new Date(), null !== s3.compression && (s3.compression = s3.compression.toUpperCase()), "string" == typeof s3.unixPermissions && (s3.unixPermissions = parseInt(s3.unixPermissions, 8)), s3.unixPermissions && 16384 & s3.unixPermissions && (s3.dir = true), s3.dosPermissions && 16 & s3.dosPermissions && (s3.dir = true), s3.dir && (e3 = g(e3)), s3.createFolders && (n3 = _(e3)) && b2.call(this, n3, true);
              var a3 = "string" === i2 && false === s3.binary && false === s3.base64;
              r2 && void 0 !== r2.binary || (s3.binary = !a3), (t3 instanceof c2 && 0 === t3.uncompressedSize || s3.dir || !t3 || 0 === t3.length) && (s3.base64 = false, s3.binary = true, t3 = "", s3.compression = "STORE", i2 = "string");
              var o3 = null;
              o3 = t3 instanceof c2 || t3 instanceof l2 ? t3 : p2.isNode && p2.isStream(t3) ? new m2(e3, t3) : u2.prepareContent(e3, t3, s3.binary, s3.optimizedBinaryString, s3.base64);
              var h4 = new d2(e3, o3, s3);
              this.files[e3] = h4;
            }
            var i = e2("./utf8"), u2 = e2("./utils"), l2 = e2("./stream/GenericWorker"), a2 = e2("./stream/StreamHelper"), f2 = e2("./defaults"), c2 = e2("./compressedObject"), d2 = e2("./zipObject"), o2 = e2("./generate"), p2 = e2("./nodejsUtils"), m2 = e2("./nodejs/NodejsStreamInputAdapter"), _ = function(e3) {
              "/" === e3.slice(-1) && (e3 = e3.substring(0, e3.length - 1));
              var t3 = e3.lastIndexOf("/");
              return 0 < t3 ? e3.substring(0, t3) : "";
            }, g = function(e3) {
              return "/" !== e3.slice(-1) && (e3 += "/"), e3;
            }, b2 = function(e3, t3) {
              return t3 = void 0 !== t3 ? t3 : f2.createFolders, e3 = g(e3), this.files[e3] || s2.call(this, e3, null, { dir: true, createFolders: t3 }), this.files[e3];
            };
            function h3(e3) {
              return "[object RegExp]" === Object.prototype.toString.call(e3);
            }
            var n2 = { load: function() {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, forEach: function(e3) {
              var t3, r2, n3;
              for (t3 in this.files) n3 = this.files[t3], (r2 = t3.slice(this.root.length, t3.length)) && t3.slice(0, this.root.length) === this.root && e3(r2, n3);
            }, filter: function(r2) {
              var n3 = [];
              return this.forEach(function(e3, t3) {
                r2(e3, t3) && n3.push(t3);
              }), n3;
            }, file: function(e3, t3, r2) {
              if (1 !== arguments.length) return e3 = this.root + e3, s2.call(this, e3, t3, r2), this;
              if (h3(e3)) {
                var n3 = e3;
                return this.filter(function(e4, t4) {
                  return !t4.dir && n3.test(e4);
                });
              }
              var i2 = this.files[this.root + e3];
              return i2 && !i2.dir ? i2 : null;
            }, folder: function(r2) {
              if (!r2) return this;
              if (h3(r2)) return this.filter(function(e4, t4) {
                return t4.dir && r2.test(e4);
              });
              var e3 = this.root + r2, t3 = b2.call(this, e3), n3 = this.clone();
              return n3.root = t3.name, n3;
            }, remove: function(r2) {
              r2 = this.root + r2;
              var e3 = this.files[r2];
              if (e3 || ("/" !== r2.slice(-1) && (r2 += "/"), e3 = this.files[r2]), e3 && !e3.dir) delete this.files[r2];
              else for (var t3 = this.filter(function(e4, t4) {
                return t4.name.slice(0, r2.length) === r2;
              }), n3 = 0; n3 < t3.length; n3++) delete this.files[t3[n3].name];
              return this;
            }, generate: function() {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, generateInternalStream: function(e3) {
              var t3, r2 = {};
              try {
                if ((r2 = u2.extend(e3 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
                u2.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
                var n3 = r2.comment || this.comment || "";
                t3 = o2.generateWorker(this, r2, n3);
              } catch (e4) {
                (t3 = new l2("error")).error(e4);
              }
              return new a2(t3, r2.type || "string", r2.mimeType);
            }, generateAsync: function(e3, t3) {
              return this.generateInternalStream(e3).accumulate(t3);
            }, generateNodeStream: function(e3, t3) {
              return (e3 = e3 || {}).type || (e3.type = "nodebuffer"), this.generateInternalStream(e3).toNodejsStream(t3);
            } };
            t2.exports = n2;
          }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e2, t2, r) {
            t2.exports = e2("stream");
          }, { stream: void 0 }], 17: [function(e2, t2, r) {
            var n2 = e2("./DataReader");
            function i(e3) {
              n2.call(this, e3);
              for (var t3 = 0; t3 < this.data.length; t3++) e3[t3] = 255 & e3[t3];
            }
            e2("../utils").inherits(i, n2), i.prototype.byteAt = function(e3) {
              return this.data[this.zero + e3];
            }, i.prototype.lastIndexOfSignature = function(e3) {
              for (var t3 = e3.charCodeAt(0), r2 = e3.charCodeAt(1), n3 = e3.charCodeAt(2), i2 = e3.charCodeAt(3), s2 = this.length - 4; 0 <= s2; --s2) if (this.data[s2] === t3 && this.data[s2 + 1] === r2 && this.data[s2 + 2] === n3 && this.data[s2 + 3] === i2) return s2 - this.zero;
              return -1;
            }, i.prototype.readAndCheckSignature = function(e3) {
              var t3 = e3.charCodeAt(0), r2 = e3.charCodeAt(1), n3 = e3.charCodeAt(2), i2 = e3.charCodeAt(3), s2 = this.readData(4);
              return t3 === s2[0] && r2 === s2[1] && n3 === s2[2] && i2 === s2[3];
            }, i.prototype.readData = function(e3) {
              if (this.checkOffset(e3), 0 === e3) return [];
              var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e3);
              return this.index += e3, t3;
            }, t2.exports = i;
          }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e2, t2, r) {
            var n2 = e2("../utils");
            function i(e3) {
              this.data = e3, this.length = e3.length, this.index = 0, this.zero = 0;
            }
            i.prototype = { checkOffset: function(e3) {
              this.checkIndex(this.index + e3);
            }, checkIndex: function(e3) {
              if (this.length < this.zero + e3 || e3 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e3 + "). Corrupted zip ?");
            }, setIndex: function(e3) {
              this.checkIndex(e3), this.index = e3;
            }, skip: function(e3) {
              this.setIndex(this.index + e3);
            }, byteAt: function() {
            }, readInt: function(e3) {
              var t3, r2 = 0;
              for (this.checkOffset(e3), t3 = this.index + e3 - 1; t3 >= this.index; t3--) r2 = (r2 << 8) + this.byteAt(t3);
              return this.index += e3, r2;
            }, readString: function(e3) {
              return n2.transformTo("string", this.readData(e3));
            }, readData: function() {
            }, lastIndexOfSignature: function() {
            }, readAndCheckSignature: function() {
            }, readDate: function() {
              var e3 = this.readInt(4);
              return new Date(Date.UTC(1980 + (e3 >> 25 & 127), (e3 >> 21 & 15) - 1, e3 >> 16 & 31, e3 >> 11 & 31, e3 >> 5 & 63, (31 & e3) << 1));
            } }, t2.exports = i;
          }, { "../utils": 32 }], 19: [function(e2, t2, r) {
            var n2 = e2("./Uint8ArrayReader");
            function i(e3) {
              n2.call(this, e3);
            }
            e2("../utils").inherits(i, n2), i.prototype.readData = function(e3) {
              this.checkOffset(e3);
              var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e3);
              return this.index += e3, t3;
            }, t2.exports = i;
          }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e2, t2, r) {
            var n2 = e2("./DataReader");
            function i(e3) {
              n2.call(this, e3);
            }
            e2("../utils").inherits(i, n2), i.prototype.byteAt = function(e3) {
              return this.data.charCodeAt(this.zero + e3);
            }, i.prototype.lastIndexOfSignature = function(e3) {
              return this.data.lastIndexOf(e3) - this.zero;
            }, i.prototype.readAndCheckSignature = function(e3) {
              return e3 === this.readData(4);
            }, i.prototype.readData = function(e3) {
              this.checkOffset(e3);
              var t3 = this.data.slice(this.zero + this.index, this.zero + this.index + e3);
              return this.index += e3, t3;
            }, t2.exports = i;
          }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e2, t2, r) {
            var n2 = e2("./ArrayReader");
            function i(e3) {
              n2.call(this, e3);
            }
            e2("../utils").inherits(i, n2), i.prototype.readData = function(e3) {
              if (this.checkOffset(e3), 0 === e3) return new Uint8Array(0);
              var t3 = this.data.subarray(this.zero + this.index, this.zero + this.index + e3);
              return this.index += e3, t3;
            }, t2.exports = i;
          }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e2, t2, r) {
            var n2 = e2("../utils"), i = e2("../support"), s2 = e2("./ArrayReader"), a2 = e2("./StringReader"), o2 = e2("./NodeBufferReader"), h3 = e2("./Uint8ArrayReader");
            t2.exports = function(e3) {
              var t3 = n2.getTypeOf(e3);
              return n2.checkSupport(t3), "string" !== t3 || i.uint8array ? "nodebuffer" === t3 ? new o2(e3) : i.uint8array ? new h3(n2.transformTo("uint8array", e3)) : new s2(n2.transformTo("array", e3)) : new a2(e3);
            };
          }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e2, t2, r) {
            r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
          }, {}], 24: [function(e2, t2, r) {
            var n2 = e2("./GenericWorker"), i = e2("../utils");
            function s2(e3) {
              n2.call(this, "ConvertWorker to " + e3), this.destType = e3;
            }
            i.inherits(s2, n2), s2.prototype.processChunk = function(e3) {
              this.push({ data: i.transformTo(this.destType, e3.data), meta: e3.meta });
            }, t2.exports = s2;
          }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e2, t2, r) {
            var n2 = e2("./GenericWorker"), i = e2("../crc32");
            function s2() {
              n2.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
            }
            e2("../utils").inherits(s2, n2), s2.prototype.processChunk = function(e3) {
              this.streamInfo.crc32 = i(e3.data, this.streamInfo.crc32 || 0), this.push(e3);
            }, t2.exports = s2;
          }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e2, t2, r) {
            var n2 = e2("../utils"), i = e2("./GenericWorker");
            function s2(e3) {
              i.call(this, "DataLengthProbe for " + e3), this.propName = e3, this.withStreamInfo(e3, 0);
            }
            n2.inherits(s2, i), s2.prototype.processChunk = function(e3) {
              if (e3) {
                var t3 = this.streamInfo[this.propName] || 0;
                this.streamInfo[this.propName] = t3 + e3.data.length;
              }
              i.prototype.processChunk.call(this, e3);
            }, t2.exports = s2;
          }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e2, t2, r) {
            var n2 = e2("../utils"), i = e2("./GenericWorker");
            function s2(e3) {
              i.call(this, "DataWorker");
              var t3 = this;
              this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e3.then(function(e4) {
                t3.dataIsReady = true, t3.data = e4, t3.max = e4 && e4.length || 0, t3.type = n2.getTypeOf(e4), t3.isPaused || t3._tickAndRepeat();
              }, function(e4) {
                t3.error(e4);
              });
            }
            n2.inherits(s2, i), s2.prototype.cleanUp = function() {
              i.prototype.cleanUp.call(this), this.data = null;
            }, s2.prototype.resume = function() {
              return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n2.delay(this._tickAndRepeat, [], this)), true);
            }, s2.prototype._tickAndRepeat = function() {
              this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n2.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
            }, s2.prototype._tick = function() {
              if (this.isPaused || this.isFinished) return false;
              var e3 = null, t3 = Math.min(this.max, this.index + 16384);
              if (this.index >= this.max) return this.end();
              switch (this.type) {
                case "string":
                  e3 = this.data.substring(this.index, t3);
                  break;
                case "uint8array":
                  e3 = this.data.subarray(this.index, t3);
                  break;
                case "array":
                case "nodebuffer":
                  e3 = this.data.slice(this.index, t3);
              }
              return this.index = t3, this.push({ data: e3, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
            }, t2.exports = s2;
          }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e2, t2, r) {
            function n2(e3) {
              this.name = e3 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
            }
            n2.prototype = { push: function(e3) {
              this.emit("data", e3);
            }, end: function() {
              if (this.isFinished) return false;
              this.flush();
              try {
                this.emit("end"), this.cleanUp(), this.isFinished = true;
              } catch (e3) {
                this.emit("error", e3);
              }
              return true;
            }, error: function(e3) {
              return !this.isFinished && (this.isPaused ? this.generatedError = e3 : (this.isFinished = true, this.emit("error", e3), this.previous && this.previous.error(e3), this.cleanUp()), true);
            }, on: function(e3, t3) {
              return this._listeners[e3].push(t3), this;
            }, cleanUp: function() {
              this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
            }, emit: function(e3, t3) {
              if (this._listeners[e3]) for (var r2 = 0; r2 < this._listeners[e3].length; r2++) this._listeners[e3][r2].call(this, t3);
            }, pipe: function(e3) {
              return e3.registerPrevious(this);
            }, registerPrevious: function(e3) {
              if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
              this.streamInfo = e3.streamInfo, this.mergeStreamInfo(), this.previous = e3;
              var t3 = this;
              return e3.on("data", function(e4) {
                t3.processChunk(e4);
              }), e3.on("end", function() {
                t3.end();
              }), e3.on("error", function(e4) {
                t3.error(e4);
              }), this;
            }, pause: function() {
              return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
            }, resume: function() {
              if (!this.isPaused || this.isFinished) return false;
              var e3 = this.isPaused = false;
              return this.generatedError && (this.error(this.generatedError), e3 = true), this.previous && this.previous.resume(), !e3;
            }, flush: function() {
            }, processChunk: function(e3) {
              this.push(e3);
            }, withStreamInfo: function(e3, t3) {
              return this.extraStreamInfo[e3] = t3, this.mergeStreamInfo(), this;
            }, mergeStreamInfo: function() {
              for (var e3 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e3) && (this.streamInfo[e3] = this.extraStreamInfo[e3]);
            }, lock: function() {
              if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
              this.isLocked = true, this.previous && this.previous.lock();
            }, toString: function() {
              var e3 = "Worker " + this.name;
              return this.previous ? this.previous + " -> " + e3 : e3;
            } }, t2.exports = n2;
          }, {}], 29: [function(e2, t2, r) {
            var h3 = e2("../utils"), i = e2("./ConvertWorker"), s2 = e2("./GenericWorker"), u2 = e2("../base64"), n2 = e2("../support"), a2 = e2("../external"), o2 = null;
            if (n2.nodestream) try {
              o2 = e2("../nodejs/NodejsStreamOutputAdapter");
            } catch (e3) {
            }
            function l2(e3, o3) {
              return new a2.Promise(function(t3, r2) {
                var n3 = [], i2 = e3._internalType, s3 = e3._outputType, a3 = e3._mimeType;
                e3.on("data", function(e4, t4) {
                  n3.push(e4), o3 && o3(t4);
                }).on("error", function(e4) {
                  n3 = [], r2(e4);
                }).on("end", function() {
                  try {
                    var e4 = (function(e5, t4, r3) {
                      switch (e5) {
                        case "blob":
                          return h3.newBlob(h3.transformTo("arraybuffer", t4), r3);
                        case "base64":
                          return u2.encode(t4);
                        default:
                          return h3.transformTo(e5, t4);
                      }
                    })(s3, (function(e5, t4) {
                      var r3, n4 = 0, i3 = null, s4 = 0;
                      for (r3 = 0; r3 < t4.length; r3++) s4 += t4[r3].length;
                      switch (e5) {
                        case "string":
                          return t4.join("");
                        case "array":
                          return Array.prototype.concat.apply([], t4);
                        case "uint8array":
                          for (i3 = new Uint8Array(s4), r3 = 0; r3 < t4.length; r3++) i3.set(t4[r3], n4), n4 += t4[r3].length;
                          return i3;
                        case "nodebuffer":
                          return Buffer2.concat(t4);
                        default:
                          throw new Error("concat : unsupported type '" + e5 + "'");
                      }
                    })(i2, n3), a3);
                    t3(e4);
                  } catch (e5) {
                    r2(e5);
                  }
                  n3 = [];
                }).resume();
              });
            }
            function f2(e3, t3, r2) {
              var n3 = t3;
              switch (t3) {
                case "blob":
                case "arraybuffer":
                  n3 = "uint8array";
                  break;
                case "base64":
                  n3 = "string";
              }
              try {
                this._internalType = n3, this._outputType = t3, this._mimeType = r2, h3.checkSupport(n3), this._worker = e3.pipe(new i(n3)), e3.lock();
              } catch (e4) {
                this._worker = new s2("error"), this._worker.error(e4);
              }
            }
            f2.prototype = { accumulate: function(e3) {
              return l2(this, e3);
            }, on: function(e3, t3) {
              var r2 = this;
              return "data" === e3 ? this._worker.on(e3, function(e4) {
                t3.call(r2, e4.data, e4.meta);
              }) : this._worker.on(e3, function() {
                h3.delay(t3, arguments, r2);
              }), this;
            }, resume: function() {
              return h3.delay(this._worker.resume, [], this._worker), this;
            }, pause: function() {
              return this._worker.pause(), this;
            }, toNodejsStream: function(e3) {
              if (h3.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
              return new o2(this, { objectMode: "nodebuffer" !== this._outputType }, e3);
            } }, t2.exports = f2;
          }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e2, t2, r) {
            if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer2, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
            else {
              var n2 = new ArrayBuffer(0);
              try {
                r.blob = 0 === new Blob([n2], { type: "application/zip" }).size;
              } catch (e3) {
                try {
                  var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                  i.append(n2), r.blob = 0 === i.getBlob("application/zip").size;
                } catch (e4) {
                  r.blob = false;
                }
              }
            }
            try {
              r.nodestream = !!e2("readable-stream").Readable;
            } catch (e3) {
              r.nodestream = false;
            }
          }, { "readable-stream": 16 }], 31: [function(e2, t2, s2) {
            for (var o2 = e2("./utils"), h3 = e2("./support"), r = e2("./nodejsUtils"), n2 = e2("./stream/GenericWorker"), u2 = new Array(256), i = 0; i < 256; i++) u2[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
            u2[254] = u2[254] = 1;
            function a2() {
              n2.call(this, "utf-8 decode"), this.leftOver = null;
            }
            function l2() {
              n2.call(this, "utf-8 encode");
            }
            s2.utf8encode = function(e3) {
              return h3.nodebuffer ? r.newBufferFrom(e3, "utf-8") : (function(e4) {
                var t3, r2, n3, i2, s3, a3 = e4.length, o3 = 0;
                for (i2 = 0; i2 < a3; i2++) 55296 == (64512 & (r2 = e4.charCodeAt(i2))) && i2 + 1 < a3 && 56320 == (64512 & (n3 = e4.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n3 - 56320), i2++), o3 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
                for (t3 = h3.uint8array ? new Uint8Array(o3) : new Array(o3), i2 = s3 = 0; s3 < o3; i2++) 55296 == (64512 & (r2 = e4.charCodeAt(i2))) && i2 + 1 < a3 && 56320 == (64512 & (n3 = e4.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n3 - 56320), i2++), r2 < 128 ? t3[s3++] = r2 : (r2 < 2048 ? t3[s3++] = 192 | r2 >>> 6 : (r2 < 65536 ? t3[s3++] = 224 | r2 >>> 12 : (t3[s3++] = 240 | r2 >>> 18, t3[s3++] = 128 | r2 >>> 12 & 63), t3[s3++] = 128 | r2 >>> 6 & 63), t3[s3++] = 128 | 63 & r2);
                return t3;
              })(e3);
            }, s2.utf8decode = function(e3) {
              return h3.nodebuffer ? o2.transformTo("nodebuffer", e3).toString("utf-8") : (function(e4) {
                var t3, r2, n3, i2, s3 = e4.length, a3 = new Array(2 * s3);
                for (t3 = r2 = 0; t3 < s3; ) if ((n3 = e4[t3++]) < 128) a3[r2++] = n3;
                else if (4 < (i2 = u2[n3])) a3[r2++] = 65533, t3 += i2 - 1;
                else {
                  for (n3 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t3 < s3; ) n3 = n3 << 6 | 63 & e4[t3++], i2--;
                  1 < i2 ? a3[r2++] = 65533 : n3 < 65536 ? a3[r2++] = n3 : (n3 -= 65536, a3[r2++] = 55296 | n3 >> 10 & 1023, a3[r2++] = 56320 | 1023 & n3);
                }
                return a3.length !== r2 && (a3.subarray ? a3 = a3.subarray(0, r2) : a3.length = r2), o2.applyFromCharCode(a3);
              })(e3 = o2.transformTo(h3.uint8array ? "uint8array" : "array", e3));
            }, o2.inherits(a2, n2), a2.prototype.processChunk = function(e3) {
              var t3 = o2.transformTo(h3.uint8array ? "uint8array" : "array", e3.data);
              if (this.leftOver && this.leftOver.length) {
                if (h3.uint8array) {
                  var r2 = t3;
                  (t3 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t3.set(r2, this.leftOver.length);
                } else t3 = this.leftOver.concat(t3);
                this.leftOver = null;
              }
              var n3 = (function(e4, t4) {
                var r3;
                for ((t4 = t4 || e4.length) > e4.length && (t4 = e4.length), r3 = t4 - 1; 0 <= r3 && 128 == (192 & e4[r3]); ) r3--;
                return r3 < 0 ? t4 : 0 === r3 ? t4 : r3 + u2[e4[r3]] > t4 ? r3 : t4;
              })(t3), i2 = t3;
              n3 !== t3.length && (h3.uint8array ? (i2 = t3.subarray(0, n3), this.leftOver = t3.subarray(n3, t3.length)) : (i2 = t3.slice(0, n3), this.leftOver = t3.slice(n3, t3.length))), this.push({ data: s2.utf8decode(i2), meta: e3.meta });
            }, a2.prototype.flush = function() {
              this.leftOver && this.leftOver.length && (this.push({ data: s2.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
            }, s2.Utf8DecodeWorker = a2, o2.inherits(l2, n2), l2.prototype.processChunk = function(e3) {
              this.push({ data: s2.utf8encode(e3.data), meta: e3.meta });
            }, s2.Utf8EncodeWorker = l2;
          }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e2, t2, a2) {
            var o2 = e2("./support"), h3 = e2("./base64"), r = e2("./nodejsUtils"), u2 = e2("./external");
            function n2(e3) {
              return e3;
            }
            function l2(e3, t3) {
              for (var r2 = 0; r2 < e3.length; ++r2) t3[r2] = 255 & e3.charCodeAt(r2);
              return t3;
            }
            e2("setimmediate"), a2.newBlob = function(t3, r2) {
              a2.checkSupport("blob");
              try {
                return new Blob([t3], { type: r2 });
              } catch (e3) {
                try {
                  var n3 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
                  return n3.append(t3), n3.getBlob(r2);
                } catch (e4) {
                  throw new Error("Bug : can't construct the Blob.");
                }
              }
            };
            var i = { stringifyByChunk: function(e3, t3, r2) {
              var n3 = [], i2 = 0, s3 = e3.length;
              if (s3 <= r2) return String.fromCharCode.apply(null, e3);
              for (; i2 < s3; ) "array" === t3 || "nodebuffer" === t3 ? n3.push(String.fromCharCode.apply(null, e3.slice(i2, Math.min(i2 + r2, s3)))) : n3.push(String.fromCharCode.apply(null, e3.subarray(i2, Math.min(i2 + r2, s3)))), i2 += r2;
              return n3.join("");
            }, stringifyByChar: function(e3) {
              for (var t3 = "", r2 = 0; r2 < e3.length; r2++) t3 += String.fromCharCode(e3[r2]);
              return t3;
            }, applyCanBeUsed: { uint8array: (function() {
              try {
                return o2.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
              } catch (e3) {
                return false;
              }
            })(), nodebuffer: (function() {
              try {
                return o2.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
              } catch (e3) {
                return false;
              }
            })() } };
            function s2(e3) {
              var t3 = 65536, r2 = a2.getTypeOf(e3), n3 = true;
              if ("uint8array" === r2 ? n3 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n3 = i.applyCanBeUsed.nodebuffer), n3) for (; 1 < t3; ) try {
                return i.stringifyByChunk(e3, r2, t3);
              } catch (e4) {
                t3 = Math.floor(t3 / 2);
              }
              return i.stringifyByChar(e3);
            }
            function f2(e3, t3) {
              for (var r2 = 0; r2 < e3.length; r2++) t3[r2] = e3[r2];
              return t3;
            }
            a2.applyFromCharCode = s2;
            var c2 = {};
            c2.string = { string: n2, array: function(e3) {
              return l2(e3, new Array(e3.length));
            }, arraybuffer: function(e3) {
              return c2.string.uint8array(e3).buffer;
            }, uint8array: function(e3) {
              return l2(e3, new Uint8Array(e3.length));
            }, nodebuffer: function(e3) {
              return l2(e3, r.allocBuffer(e3.length));
            } }, c2.array = { string: s2, array: n2, arraybuffer: function(e3) {
              return new Uint8Array(e3).buffer;
            }, uint8array: function(e3) {
              return new Uint8Array(e3);
            }, nodebuffer: function(e3) {
              return r.newBufferFrom(e3);
            } }, c2.arraybuffer = { string: function(e3) {
              return s2(new Uint8Array(e3));
            }, array: function(e3) {
              return f2(new Uint8Array(e3), new Array(e3.byteLength));
            }, arraybuffer: n2, uint8array: function(e3) {
              return new Uint8Array(e3);
            }, nodebuffer: function(e3) {
              return r.newBufferFrom(new Uint8Array(e3));
            } }, c2.uint8array = { string: s2, array: function(e3) {
              return f2(e3, new Array(e3.length));
            }, arraybuffer: function(e3) {
              return e3.buffer;
            }, uint8array: n2, nodebuffer: function(e3) {
              return r.newBufferFrom(e3);
            } }, c2.nodebuffer = { string: s2, array: function(e3) {
              return f2(e3, new Array(e3.length));
            }, arraybuffer: function(e3) {
              return c2.nodebuffer.uint8array(e3).buffer;
            }, uint8array: function(e3) {
              return f2(e3, new Uint8Array(e3.length));
            }, nodebuffer: n2 }, a2.transformTo = function(e3, t3) {
              if (t3 = t3 || "", !e3) return t3;
              a2.checkSupport(e3);
              var r2 = a2.getTypeOf(t3);
              return c2[r2][e3](t3);
            }, a2.resolve = function(e3) {
              for (var t3 = e3.split("/"), r2 = [], n3 = 0; n3 < t3.length; n3++) {
                var i2 = t3[n3];
                "." === i2 || "" === i2 && 0 !== n3 && n3 !== t3.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
              }
              return r2.join("/");
            }, a2.getTypeOf = function(e3) {
              return "string" == typeof e3 ? "string" : "[object Array]" === Object.prototype.toString.call(e3) ? "array" : o2.nodebuffer && r.isBuffer(e3) ? "nodebuffer" : o2.uint8array && e3 instanceof Uint8Array ? "uint8array" : o2.arraybuffer && e3 instanceof ArrayBuffer ? "arraybuffer" : void 0;
            }, a2.checkSupport = function(e3) {
              if (!o2[e3.toLowerCase()]) throw new Error(e3 + " is not supported by this platform");
            }, a2.MAX_VALUE_16BITS = 65535, a2.MAX_VALUE_32BITS = -1, a2.pretty = function(e3) {
              var t3, r2, n3 = "";
              for (r2 = 0; r2 < (e3 || "").length; r2++) n3 += "\\x" + ((t3 = e3.charCodeAt(r2)) < 16 ? "0" : "") + t3.toString(16).toUpperCase();
              return n3;
            }, a2.delay = function(e3, t3, r2) {
              setImmediate(function() {
                e3.apply(r2 || null, t3 || []);
              });
            }, a2.inherits = function(e3, t3) {
              function r2() {
              }
              r2.prototype = t3.prototype, e3.prototype = new r2();
            }, a2.extend = function() {
              var e3, t3, r2 = {};
              for (e3 = 0; e3 < arguments.length; e3++) for (t3 in arguments[e3]) Object.prototype.hasOwnProperty.call(arguments[e3], t3) && void 0 === r2[t3] && (r2[t3] = arguments[e3][t3]);
              return r2;
            }, a2.prepareContent = function(r2, e3, n3, i2, s3) {
              return u2.Promise.resolve(e3).then(function(n4) {
                return o2.blob && (n4 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n4))) && "undefined" != typeof FileReader ? new u2.Promise(function(t3, r3) {
                  var e4 = new FileReader();
                  e4.onload = function(e5) {
                    t3(e5.target.result);
                  }, e4.onerror = function(e5) {
                    r3(e5.target.error);
                  }, e4.readAsArrayBuffer(n4);
                }) : n4;
              }).then(function(e4) {
                var t3 = a2.getTypeOf(e4);
                return t3 ? ("arraybuffer" === t3 ? e4 = a2.transformTo("uint8array", e4) : "string" === t3 && (s3 ? e4 = h3.decode(e4) : n3 && true !== i2 && (e4 = (function(e5) {
                  return l2(e5, o2.uint8array ? new Uint8Array(e5.length) : new Array(e5.length));
                })(e4))), e4) : u2.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
              });
            };
          }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e2, t2, r) {
            var n2 = e2("./reader/readerFor"), i = e2("./utils"), s2 = e2("./signature"), a2 = e2("./zipEntry"), o2 = e2("./support");
            function h3(e3) {
              this.files = [], this.loadOptions = e3;
            }
            h3.prototype = { checkSignature: function(e3) {
              if (!this.reader.readAndCheckSignature(e3)) {
                this.reader.index -= 4;
                var t3 = this.reader.readString(4);
                throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t3) + ", expected " + i.pretty(e3) + ")");
              }
            }, isSignature: function(e3, t3) {
              var r2 = this.reader.index;
              this.reader.setIndex(e3);
              var n3 = this.reader.readString(4) === t3;
              return this.reader.setIndex(r2), n3;
            }, readBlockEndOfCentral: function() {
              this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
              var e3 = this.reader.readData(this.zipCommentLength), t3 = o2.uint8array ? "uint8array" : "array", r2 = i.transformTo(t3, e3);
              this.zipComment = this.loadOptions.decodeFileName(r2);
            }, readBlockZip64EndOfCentral: function() {
              this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
              for (var e3, t3, r2, n3 = this.zip64EndOfCentralSize - 44; 0 < n3; ) e3 = this.reader.readInt(2), t3 = this.reader.readInt(4), r2 = this.reader.readData(t3), this.zip64ExtensibleData[e3] = { id: e3, length: t3, value: r2 };
            }, readBlockZip64EndOfCentralLocator: function() {
              if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
            }, readLocalFiles: function() {
              var e3, t3;
              for (e3 = 0; e3 < this.files.length; e3++) t3 = this.files[e3], this.reader.setIndex(t3.localHeaderOffset), this.checkSignature(s2.LOCAL_FILE_HEADER), t3.readLocalPart(this.reader), t3.handleUTF8(), t3.processAttributes();
            }, readCentralDir: function() {
              var e3;
              for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s2.CENTRAL_FILE_HEADER); ) (e3 = new a2({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e3);
              if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
            }, readEndOfCentral: function() {
              var e3 = this.reader.lastIndexOfSignature(s2.CENTRAL_DIRECTORY_END);
              if (e3 < 0) throw !this.isSignature(0, s2.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
              this.reader.setIndex(e3);
              var t3 = e3;
              if (this.checkSignature(s2.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
                if (this.zip64 = true, (e3 = this.reader.lastIndexOfSignature(s2.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
                if (this.reader.setIndex(e3), this.checkSignature(s2.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s2.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s2.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s2.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
              }
              var r2 = this.centralDirOffset + this.centralDirSize;
              this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
              var n3 = t3 - r2;
              if (0 < n3) this.isSignature(t3, s2.CENTRAL_FILE_HEADER) || (this.reader.zero = n3);
              else if (n3 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n3) + " bytes.");
            }, prepareReader: function(e3) {
              this.reader = n2(e3);
            }, load: function(e3) {
              this.prepareReader(e3), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
            } }, t2.exports = h3;
          }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e2, t2, r) {
            var n2 = e2("./reader/readerFor"), s2 = e2("./utils"), i = e2("./compressedObject"), a2 = e2("./crc32"), o2 = e2("./utf8"), h3 = e2("./compressions"), u2 = e2("./support");
            function l2(e3, t3) {
              this.options = e3, this.loadOptions = t3;
            }
            l2.prototype = { isEncrypted: function() {
              return 1 == (1 & this.bitFlag);
            }, useUTF8: function() {
              return 2048 == (2048 & this.bitFlag);
            }, readLocalPart: function(e3) {
              var t3, r2;
              if (e3.skip(22), this.fileNameLength = e3.readInt(2), r2 = e3.readInt(2), this.fileName = e3.readData(this.fileNameLength), e3.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
              if (null === (t3 = (function(e4) {
                for (var t4 in h3) if (Object.prototype.hasOwnProperty.call(h3, t4) && h3[t4].magic === e4) return h3[t4];
                return null;
              })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s2.pretty(this.compressionMethod) + " unknown (inner file : " + s2.transformTo("string", this.fileName) + ")");
              this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t3, e3.readData(this.compressedSize));
            }, readCentralPart: function(e3) {
              this.versionMadeBy = e3.readInt(2), e3.skip(2), this.bitFlag = e3.readInt(2), this.compressionMethod = e3.readString(2), this.date = e3.readDate(), this.crc32 = e3.readInt(4), this.compressedSize = e3.readInt(4), this.uncompressedSize = e3.readInt(4);
              var t3 = e3.readInt(2);
              if (this.extraFieldsLength = e3.readInt(2), this.fileCommentLength = e3.readInt(2), this.diskNumberStart = e3.readInt(2), this.internalFileAttributes = e3.readInt(2), this.externalFileAttributes = e3.readInt(4), this.localHeaderOffset = e3.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
              e3.skip(t3), this.readExtraFields(e3), this.parseZIP64ExtraField(e3), this.fileComment = e3.readData(this.fileCommentLength);
            }, processAttributes: function() {
              this.unixPermissions = null, this.dosPermissions = null;
              var e3 = this.versionMadeBy >> 8;
              this.dir = !!(16 & this.externalFileAttributes), 0 == e3 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e3 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
            }, parseZIP64ExtraField: function() {
              if (this.extraFields[1]) {
                var e3 = n2(this.extraFields[1].value);
                this.uncompressedSize === s2.MAX_VALUE_32BITS && (this.uncompressedSize = e3.readInt(8)), this.compressedSize === s2.MAX_VALUE_32BITS && (this.compressedSize = e3.readInt(8)), this.localHeaderOffset === s2.MAX_VALUE_32BITS && (this.localHeaderOffset = e3.readInt(8)), this.diskNumberStart === s2.MAX_VALUE_32BITS && (this.diskNumberStart = e3.readInt(4));
              }
            }, readExtraFields: function(e3) {
              var t3, r2, n3, i2 = e3.index + this.extraFieldsLength;
              for (this.extraFields || (this.extraFields = {}); e3.index + 4 < i2; ) t3 = e3.readInt(2), r2 = e3.readInt(2), n3 = e3.readData(r2), this.extraFields[t3] = { id: t3, length: r2, value: n3 };
              e3.setIndex(i2);
            }, handleUTF8: function() {
              var e3 = u2.uint8array ? "uint8array" : "array";
              if (this.useUTF8()) this.fileNameStr = o2.utf8decode(this.fileName), this.fileCommentStr = o2.utf8decode(this.fileComment);
              else {
                var t3 = this.findExtraFieldUnicodePath();
                if (null !== t3) this.fileNameStr = t3;
                else {
                  var r2 = s2.transformTo(e3, this.fileName);
                  this.fileNameStr = this.loadOptions.decodeFileName(r2);
                }
                var n3 = this.findExtraFieldUnicodeComment();
                if (null !== n3) this.fileCommentStr = n3;
                else {
                  var i2 = s2.transformTo(e3, this.fileComment);
                  this.fileCommentStr = this.loadOptions.decodeFileName(i2);
                }
              }
            }, findExtraFieldUnicodePath: function() {
              var e3 = this.extraFields[28789];
              if (e3) {
                var t3 = n2(e3.value);
                return 1 !== t3.readInt(1) ? null : a2(this.fileName) !== t3.readInt(4) ? null : o2.utf8decode(t3.readData(e3.length - 5));
              }
              return null;
            }, findExtraFieldUnicodeComment: function() {
              var e3 = this.extraFields[25461];
              if (e3) {
                var t3 = n2(e3.value);
                return 1 !== t3.readInt(1) ? null : a2(this.fileComment) !== t3.readInt(4) ? null : o2.utf8decode(t3.readData(e3.length - 5));
              }
              return null;
            } }, t2.exports = l2;
          }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e2, t2, r) {
            function n2(e3, t3, r2) {
              this.name = e3, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t3, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
            }
            var s2 = e2("./stream/StreamHelper"), i = e2("./stream/DataWorker"), a2 = e2("./utf8"), o2 = e2("./compressedObject"), h3 = e2("./stream/GenericWorker");
            n2.prototype = { internalStream: function(e3) {
              var t3 = null, r2 = "string";
              try {
                if (!e3) throw new Error("No output type specified.");
                var n3 = "string" === (r2 = e3.toLowerCase()) || "text" === r2;
                "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t3 = this._decompressWorker();
                var i2 = !this._dataBinary;
                i2 && !n3 && (t3 = t3.pipe(new a2.Utf8EncodeWorker())), !i2 && n3 && (t3 = t3.pipe(new a2.Utf8DecodeWorker()));
              } catch (e4) {
                (t3 = new h3("error")).error(e4);
              }
              return new s2(t3, r2, "");
            }, async: function(e3, t3) {
              return this.internalStream(e3).accumulate(t3);
            }, nodeStream: function(e3, t3) {
              return this.internalStream(e3 || "nodebuffer").toNodejsStream(t3);
            }, _compressWorker: function(e3, t3) {
              if (this._data instanceof o2 && this._data.compression.magic === e3.magic) return this._data.getCompressedWorker();
              var r2 = this._decompressWorker();
              return this._dataBinary || (r2 = r2.pipe(new a2.Utf8EncodeWorker())), o2.createWorkerFrom(r2, e3, t3);
            }, _decompressWorker: function() {
              return this._data instanceof o2 ? this._data.getContentWorker() : this._data instanceof h3 ? this._data : new i(this._data);
            } };
            for (var u2 = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l2 = function() {
              throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            }, f2 = 0; f2 < u2.length; f2++) n2.prototype[u2[f2]] = l2;
            t2.exports = n2;
          }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e2, l2, t2) {
            (function(t3) {
              var r, n2, e3 = t3.MutationObserver || t3.WebKitMutationObserver;
              if (e3) {
                var i = 0, s2 = new e3(u2), a2 = t3.document.createTextNode("");
                s2.observe(a2, { characterData: true }), r = function() {
                  a2.data = i = ++i % 2;
                };
              } else if (t3.setImmediate || void 0 === t3.MessageChannel) r = "document" in t3 && "onreadystatechange" in t3.document.createElement("script") ? function() {
                var e4 = t3.document.createElement("script");
                e4.onreadystatechange = function() {
                  u2(), e4.onreadystatechange = null, e4.parentNode.removeChild(e4), e4 = null;
                }, t3.document.documentElement.appendChild(e4);
              } : function() {
                setTimeout(u2, 0);
              };
              else {
                var o2 = new t3.MessageChannel();
                o2.port1.onmessage = u2, r = function() {
                  o2.port2.postMessage(0);
                };
              }
              var h3 = [];
              function u2() {
                var e4, t4;
                n2 = true;
                for (var r2 = h3.length; r2; ) {
                  for (t4 = h3, h3 = [], e4 = -1; ++e4 < r2; ) t4[e4]();
                  r2 = h3.length;
                }
                n2 = false;
              }
              l2.exports = function(e4) {
                1 !== h3.push(e4) || n2 || r();
              };
            }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
          }, {}], 37: [function(e2, t2, r) {
            var i = e2("immediate");
            function u2() {
            }
            var l2 = {}, s2 = ["REJECTED"], a2 = ["FULFILLED"], n2 = ["PENDING"];
            function o2(e3) {
              if ("function" != typeof e3) throw new TypeError("resolver must be a function");
              this.state = n2, this.queue = [], this.outcome = void 0, e3 !== u2 && d2(this, e3);
            }
            function h3(e3, t3, r2) {
              this.promise = e3, "function" == typeof t3 && (this.onFulfilled = t3, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
            }
            function f2(t3, r2, n3) {
              i(function() {
                var e3;
                try {
                  e3 = r2(n3);
                } catch (e4) {
                  return l2.reject(t3, e4);
                }
                e3 === t3 ? l2.reject(t3, new TypeError("Cannot resolve promise with itself")) : l2.resolve(t3, e3);
              });
            }
            function c2(e3) {
              var t3 = e3 && e3.then;
              if (e3 && ("object" == typeof e3 || "function" == typeof e3) && "function" == typeof t3) return function() {
                t3.apply(e3, arguments);
              };
            }
            function d2(t3, e3) {
              var r2 = false;
              function n3(e4) {
                r2 || (r2 = true, l2.reject(t3, e4));
              }
              function i2(e4) {
                r2 || (r2 = true, l2.resolve(t3, e4));
              }
              var s3 = p2(function() {
                e3(i2, n3);
              });
              "error" === s3.status && n3(s3.value);
            }
            function p2(e3, t3) {
              var r2 = {};
              try {
                r2.value = e3(t3), r2.status = "success";
              } catch (e4) {
                r2.status = "error", r2.value = e4;
              }
              return r2;
            }
            (t2.exports = o2).prototype.finally = function(t3) {
              if ("function" != typeof t3) return this;
              var r2 = this.constructor;
              return this.then(function(e3) {
                return r2.resolve(t3()).then(function() {
                  return e3;
                });
              }, function(e3) {
                return r2.resolve(t3()).then(function() {
                  throw e3;
                });
              });
            }, o2.prototype.catch = function(e3) {
              return this.then(null, e3);
            }, o2.prototype.then = function(e3, t3) {
              if ("function" != typeof e3 && this.state === a2 || "function" != typeof t3 && this.state === s2) return this;
              var r2 = new this.constructor(u2);
              this.state !== n2 ? f2(r2, this.state === a2 ? e3 : t3, this.outcome) : this.queue.push(new h3(r2, e3, t3));
              return r2;
            }, h3.prototype.callFulfilled = function(e3) {
              l2.resolve(this.promise, e3);
            }, h3.prototype.otherCallFulfilled = function(e3) {
              f2(this.promise, this.onFulfilled, e3);
            }, h3.prototype.callRejected = function(e3) {
              l2.reject(this.promise, e3);
            }, h3.prototype.otherCallRejected = function(e3) {
              f2(this.promise, this.onRejected, e3);
            }, l2.resolve = function(e3, t3) {
              var r2 = p2(c2, t3);
              if ("error" === r2.status) return l2.reject(e3, r2.value);
              var n3 = r2.value;
              if (n3) d2(e3, n3);
              else {
                e3.state = a2, e3.outcome = t3;
                for (var i2 = -1, s3 = e3.queue.length; ++i2 < s3; ) e3.queue[i2].callFulfilled(t3);
              }
              return e3;
            }, l2.reject = function(e3, t3) {
              e3.state = s2, e3.outcome = t3;
              for (var r2 = -1, n3 = e3.queue.length; ++r2 < n3; ) e3.queue[r2].callRejected(t3);
              return e3;
            }, o2.resolve = function(e3) {
              if (e3 instanceof this) return e3;
              return l2.resolve(new this(u2), e3);
            }, o2.reject = function(e3) {
              var t3 = new this(u2);
              return l2.reject(t3, e3);
            }, o2.all = function(e3) {
              var r2 = this;
              if ("[object Array]" !== Object.prototype.toString.call(e3)) return this.reject(new TypeError("must be an array"));
              var n3 = e3.length, i2 = false;
              if (!n3) return this.resolve([]);
              var s3 = new Array(n3), a3 = 0, t3 = -1, o3 = new this(u2);
              for (; ++t3 < n3; ) h4(e3[t3], t3);
              return o3;
              function h4(e4, t4) {
                r2.resolve(e4).then(function(e5) {
                  s3[t4] = e5, ++a3 !== n3 || i2 || (i2 = true, l2.resolve(o3, s3));
                }, function(e5) {
                  i2 || (i2 = true, l2.reject(o3, e5));
                });
              }
            }, o2.race = function(e3) {
              var t3 = this;
              if ("[object Array]" !== Object.prototype.toString.call(e3)) return this.reject(new TypeError("must be an array"));
              var r2 = e3.length, n3 = false;
              if (!r2) return this.resolve([]);
              var i2 = -1, s3 = new this(u2);
              for (; ++i2 < r2; ) a3 = e3[i2], t3.resolve(a3).then(function(e4) {
                n3 || (n3 = true, l2.resolve(s3, e4));
              }, function(e4) {
                n3 || (n3 = true, l2.reject(s3, e4));
              });
              var a3;
              return s3;
            };
          }, { immediate: 36 }], 38: [function(e2, t2, r) {
            var n2 = {};
            (0, e2("./lib/utils/common").assign)(n2, e2("./lib/deflate"), e2("./lib/inflate"), e2("./lib/zlib/constants")), t2.exports = n2;
          }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e2, t2, r) {
            var a2 = e2("./zlib/deflate"), o2 = e2("./utils/common"), h3 = e2("./utils/strings"), i = e2("./zlib/messages"), s2 = e2("./zlib/zstream"), u2 = Object.prototype.toString, l2 = 0, f2 = -1, c2 = 0, d2 = 8;
            function p2(e3) {
              if (!(this instanceof p2)) return new p2(e3);
              this.options = o2.assign({ level: f2, method: d2, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c2, to: "" }, e3 || {});
              var t3 = this.options;
              t3.raw && 0 < t3.windowBits ? t3.windowBits = -t3.windowBits : t3.gzip && 0 < t3.windowBits && t3.windowBits < 16 && (t3.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s2(), this.strm.avail_out = 0;
              var r2 = a2.deflateInit2(this.strm, t3.level, t3.method, t3.windowBits, t3.memLevel, t3.strategy);
              if (r2 !== l2) throw new Error(i[r2]);
              if (t3.header && a2.deflateSetHeader(this.strm, t3.header), t3.dictionary) {
                var n3;
                if (n3 = "string" == typeof t3.dictionary ? h3.string2buf(t3.dictionary) : "[object ArrayBuffer]" === u2.call(t3.dictionary) ? new Uint8Array(t3.dictionary) : t3.dictionary, (r2 = a2.deflateSetDictionary(this.strm, n3)) !== l2) throw new Error(i[r2]);
                this._dict_set = true;
              }
            }
            function n2(e3, t3) {
              var r2 = new p2(t3);
              if (r2.push(e3, true), r2.err) throw r2.msg || i[r2.err];
              return r2.result;
            }
            p2.prototype.push = function(e3, t3) {
              var r2, n3, i2 = this.strm, s3 = this.options.chunkSize;
              if (this.ended) return false;
              n3 = t3 === ~~t3 ? t3 : true === t3 ? 4 : 0, "string" == typeof e3 ? i2.input = h3.string2buf(e3) : "[object ArrayBuffer]" === u2.call(e3) ? i2.input = new Uint8Array(e3) : i2.input = e3, i2.next_in = 0, i2.avail_in = i2.input.length;
              do {
                if (0 === i2.avail_out && (i2.output = new o2.Buf8(s3), i2.next_out = 0, i2.avail_out = s3), 1 !== (r2 = a2.deflate(i2, n3)) && r2 !== l2) return this.onEnd(r2), !(this.ended = true);
                0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n3 && 2 !== n3) || ("string" === this.options.to ? this.onData(h3.buf2binstring(o2.shrinkBuf(i2.output, i2.next_out))) : this.onData(o2.shrinkBuf(i2.output, i2.next_out)));
              } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
              return 4 === n3 ? (r2 = a2.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l2) : 2 !== n3 || (this.onEnd(l2), !(i2.avail_out = 0));
            }, p2.prototype.onData = function(e3) {
              this.chunks.push(e3);
            }, p2.prototype.onEnd = function(e3) {
              e3 === l2 && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o2.flattenChunks(this.chunks)), this.chunks = [], this.err = e3, this.msg = this.strm.msg;
            }, r.Deflate = p2, r.deflate = n2, r.deflateRaw = function(e3, t3) {
              return (t3 = t3 || {}).raw = true, n2(e3, t3);
            }, r.gzip = function(e3, t3) {
              return (t3 = t3 || {}).gzip = true, n2(e3, t3);
            };
          }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e2, t2, r) {
            var c2 = e2("./zlib/inflate"), d2 = e2("./utils/common"), p2 = e2("./utils/strings"), m2 = e2("./zlib/constants"), n2 = e2("./zlib/messages"), i = e2("./zlib/zstream"), s2 = e2("./zlib/gzheader"), _ = Object.prototype.toString;
            function a2(e3) {
              if (!(this instanceof a2)) return new a2(e3);
              this.options = d2.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e3 || {});
              var t3 = this.options;
              t3.raw && 0 <= t3.windowBits && t3.windowBits < 16 && (t3.windowBits = -t3.windowBits, 0 === t3.windowBits && (t3.windowBits = -15)), !(0 <= t3.windowBits && t3.windowBits < 16) || e3 && e3.windowBits || (t3.windowBits += 32), 15 < t3.windowBits && t3.windowBits < 48 && 0 == (15 & t3.windowBits) && (t3.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
              var r2 = c2.inflateInit2(this.strm, t3.windowBits);
              if (r2 !== m2.Z_OK) throw new Error(n2[r2]);
              this.header = new s2(), c2.inflateGetHeader(this.strm, this.header);
            }
            function o2(e3, t3) {
              var r2 = new a2(t3);
              if (r2.push(e3, true), r2.err) throw r2.msg || n2[r2.err];
              return r2.result;
            }
            a2.prototype.push = function(e3, t3) {
              var r2, n3, i2, s3, a3, o3, h3 = this.strm, u2 = this.options.chunkSize, l2 = this.options.dictionary, f2 = false;
              if (this.ended) return false;
              n3 = t3 === ~~t3 ? t3 : true === t3 ? m2.Z_FINISH : m2.Z_NO_FLUSH, "string" == typeof e3 ? h3.input = p2.binstring2buf(e3) : "[object ArrayBuffer]" === _.call(e3) ? h3.input = new Uint8Array(e3) : h3.input = e3, h3.next_in = 0, h3.avail_in = h3.input.length;
              do {
                if (0 === h3.avail_out && (h3.output = new d2.Buf8(u2), h3.next_out = 0, h3.avail_out = u2), (r2 = c2.inflate(h3, m2.Z_NO_FLUSH)) === m2.Z_NEED_DICT && l2 && (o3 = "string" == typeof l2 ? p2.string2buf(l2) : "[object ArrayBuffer]" === _.call(l2) ? new Uint8Array(l2) : l2, r2 = c2.inflateSetDictionary(this.strm, o3)), r2 === m2.Z_BUF_ERROR && true === f2 && (r2 = m2.Z_OK, f2 = false), r2 !== m2.Z_STREAM_END && r2 !== m2.Z_OK) return this.onEnd(r2), !(this.ended = true);
                h3.next_out && (0 !== h3.avail_out && r2 !== m2.Z_STREAM_END && (0 !== h3.avail_in || n3 !== m2.Z_FINISH && n3 !== m2.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p2.utf8border(h3.output, h3.next_out), s3 = h3.next_out - i2, a3 = p2.buf2string(h3.output, i2), h3.next_out = s3, h3.avail_out = u2 - s3, s3 && d2.arraySet(h3.output, h3.output, i2, s3, 0), this.onData(a3)) : this.onData(d2.shrinkBuf(h3.output, h3.next_out)))), 0 === h3.avail_in && 0 === h3.avail_out && (f2 = true);
              } while ((0 < h3.avail_in || 0 === h3.avail_out) && r2 !== m2.Z_STREAM_END);
              return r2 === m2.Z_STREAM_END && (n3 = m2.Z_FINISH), n3 === m2.Z_FINISH ? (r2 = c2.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m2.Z_OK) : n3 !== m2.Z_SYNC_FLUSH || (this.onEnd(m2.Z_OK), !(h3.avail_out = 0));
            }, a2.prototype.onData = function(e3) {
              this.chunks.push(e3);
            }, a2.prototype.onEnd = function(e3) {
              e3 === m2.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d2.flattenChunks(this.chunks)), this.chunks = [], this.err = e3, this.msg = this.strm.msg;
            }, r.Inflate = a2, r.inflate = o2, r.inflateRaw = function(e3, t3) {
              return (t3 = t3 || {}).raw = true, o2(e3, t3);
            }, r.ungzip = o2;
          }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e2, t2, r) {
            var n2 = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
            r.assign = function(e3) {
              for (var t3 = Array.prototype.slice.call(arguments, 1); t3.length; ) {
                var r2 = t3.shift();
                if (r2) {
                  if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
                  for (var n3 in r2) r2.hasOwnProperty(n3) && (e3[n3] = r2[n3]);
                }
              }
              return e3;
            }, r.shrinkBuf = function(e3, t3) {
              return e3.length === t3 ? e3 : e3.subarray ? e3.subarray(0, t3) : (e3.length = t3, e3);
            };
            var i = { arraySet: function(e3, t3, r2, n3, i2) {
              if (t3.subarray && e3.subarray) e3.set(t3.subarray(r2, r2 + n3), i2);
              else for (var s3 = 0; s3 < n3; s3++) e3[i2 + s3] = t3[r2 + s3];
            }, flattenChunks: function(e3) {
              var t3, r2, n3, i2, s3, a2;
              for (t3 = n3 = 0, r2 = e3.length; t3 < r2; t3++) n3 += e3[t3].length;
              for (a2 = new Uint8Array(n3), t3 = i2 = 0, r2 = e3.length; t3 < r2; t3++) s3 = e3[t3], a2.set(s3, i2), i2 += s3.length;
              return a2;
            } }, s2 = { arraySet: function(e3, t3, r2, n3, i2) {
              for (var s3 = 0; s3 < n3; s3++) e3[i2 + s3] = t3[r2 + s3];
            }, flattenChunks: function(e3) {
              return [].concat.apply([], e3);
            } };
            r.setTyped = function(e3) {
              e3 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s2));
            }, r.setTyped(n2);
          }, {}], 42: [function(e2, t2, r) {
            var h3 = e2("./common"), i = true, s2 = true;
            try {
              String.fromCharCode.apply(null, [0]);
            } catch (e3) {
              i = false;
            }
            try {
              String.fromCharCode.apply(null, new Uint8Array(1));
            } catch (e3) {
              s2 = false;
            }
            for (var u2 = new h3.Buf8(256), n2 = 0; n2 < 256; n2++) u2[n2] = 252 <= n2 ? 6 : 248 <= n2 ? 5 : 240 <= n2 ? 4 : 224 <= n2 ? 3 : 192 <= n2 ? 2 : 1;
            function l2(e3, t3) {
              if (t3 < 65537 && (e3.subarray && s2 || !e3.subarray && i)) return String.fromCharCode.apply(null, h3.shrinkBuf(e3, t3));
              for (var r2 = "", n3 = 0; n3 < t3; n3++) r2 += String.fromCharCode(e3[n3]);
              return r2;
            }
            u2[254] = u2[254] = 1, r.string2buf = function(e3) {
              var t3, r2, n3, i2, s3, a2 = e3.length, o2 = 0;
              for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n3 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n3 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
              for (t3 = new h3.Buf8(o2), i2 = s3 = 0; s3 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n3 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n3 - 56320), i2++), r2 < 128 ? t3[s3++] = r2 : (r2 < 2048 ? t3[s3++] = 192 | r2 >>> 6 : (r2 < 65536 ? t3[s3++] = 224 | r2 >>> 12 : (t3[s3++] = 240 | r2 >>> 18, t3[s3++] = 128 | r2 >>> 12 & 63), t3[s3++] = 128 | r2 >>> 6 & 63), t3[s3++] = 128 | 63 & r2);
              return t3;
            }, r.buf2binstring = function(e3) {
              return l2(e3, e3.length);
            }, r.binstring2buf = function(e3) {
              for (var t3 = new h3.Buf8(e3.length), r2 = 0, n3 = t3.length; r2 < n3; r2++) t3[r2] = e3.charCodeAt(r2);
              return t3;
            }, r.buf2string = function(e3, t3) {
              var r2, n3, i2, s3, a2 = t3 || e3.length, o2 = new Array(2 * a2);
              for (r2 = n3 = 0; r2 < a2; ) if ((i2 = e3[r2++]) < 128) o2[n3++] = i2;
              else if (4 < (s3 = u2[i2])) o2[n3++] = 65533, r2 += s3 - 1;
              else {
                for (i2 &= 2 === s3 ? 31 : 3 === s3 ? 15 : 7; 1 < s3 && r2 < a2; ) i2 = i2 << 6 | 63 & e3[r2++], s3--;
                1 < s3 ? o2[n3++] = 65533 : i2 < 65536 ? o2[n3++] = i2 : (i2 -= 65536, o2[n3++] = 55296 | i2 >> 10 & 1023, o2[n3++] = 56320 | 1023 & i2);
              }
              return l2(o2, n3);
            }, r.utf8border = function(e3, t3) {
              var r2;
              for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r2 = t3 - 1; 0 <= r2 && 128 == (192 & e3[r2]); ) r2--;
              return r2 < 0 ? t3 : 0 === r2 ? t3 : r2 + u2[e3[r2]] > t3 ? r2 : t3;
            };
          }, { "./common": 41 }], 43: [function(e2, t2, r) {
            t2.exports = function(e3, t3, r2, n2) {
              for (var i = 65535 & e3 | 0, s2 = e3 >>> 16 & 65535 | 0, a2 = 0; 0 !== r2; ) {
                for (r2 -= a2 = 2e3 < r2 ? 2e3 : r2; s2 = s2 + (i = i + t3[n2++] | 0) | 0, --a2; ) ;
                i %= 65521, s2 %= 65521;
              }
              return i | s2 << 16 | 0;
            };
          }, {}], 44: [function(e2, t2, r) {
            t2.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
          }, {}], 45: [function(e2, t2, r) {
            var o2 = (function() {
              for (var e3, t3 = [], r2 = 0; r2 < 256; r2++) {
                e3 = r2;
                for (var n2 = 0; n2 < 8; n2++) e3 = 1 & e3 ? 3988292384 ^ e3 >>> 1 : e3 >>> 1;
                t3[r2] = e3;
              }
              return t3;
            })();
            t2.exports = function(e3, t3, r2, n2) {
              var i = o2, s2 = n2 + r2;
              e3 ^= -1;
              for (var a2 = n2; a2 < s2; a2++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a2])];
              return -1 ^ e3;
            };
          }, {}], 46: [function(e2, t2, r) {
            var h3, c2 = e2("../utils/common"), u2 = e2("./trees"), d2 = e2("./adler32"), p2 = e2("./crc32"), n2 = e2("./messages"), l2 = 0, f2 = 4, m2 = 0, _ = -2, g = -1, b2 = 4, i = 2, v3 = 8, y2 = 9, s2 = 286, a2 = 30, o2 = 19, w2 = 2 * s2 + 1, k2 = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
            function R(e3, t3) {
              return e3.msg = n2[t3], t3;
            }
            function T(e3) {
              return (e3 << 1) - (4 < e3 ? 9 : 0);
            }
            function D(e3) {
              for (var t3 = e3.length; 0 <= --t3; ) e3[t3] = 0;
            }
            function F(e3) {
              var t3 = e3.state, r2 = t3.pending;
              r2 > e3.avail_out && (r2 = e3.avail_out), 0 !== r2 && (c2.arraySet(e3.output, t3.pending_buf, t3.pending_out, r2, e3.next_out), e3.next_out += r2, t3.pending_out += r2, e3.total_out += r2, e3.avail_out -= r2, t3.pending -= r2, 0 === t3.pending && (t3.pending_out = 0));
            }
            function N(e3, t3) {
              u2._tr_flush_block(e3, 0 <= e3.block_start ? e3.block_start : -1, e3.strstart - e3.block_start, t3), e3.block_start = e3.strstart, F(e3.strm);
            }
            function U(e3, t3) {
              e3.pending_buf[e3.pending++] = t3;
            }
            function P2(e3, t3) {
              e3.pending_buf[e3.pending++] = t3 >>> 8 & 255, e3.pending_buf[e3.pending++] = 255 & t3;
            }
            function L(e3, t3) {
              var r2, n3, i2 = e3.max_chain_length, s3 = e3.strstart, a3 = e3.prev_length, o3 = e3.nice_match, h4 = e3.strstart > e3.w_size - z ? e3.strstart - (e3.w_size - z) : 0, u3 = e3.window, l3 = e3.w_mask, f3 = e3.prev, c3 = e3.strstart + S, d3 = u3[s3 + a3 - 1], p3 = u3[s3 + a3];
              e3.prev_length >= e3.good_match && (i2 >>= 2), o3 > e3.lookahead && (o3 = e3.lookahead);
              do {
                if (u3[(r2 = t3) + a3] === p3 && u3[r2 + a3 - 1] === d3 && u3[r2] === u3[s3] && u3[++r2] === u3[s3 + 1]) {
                  s3 += 2, r2++;
                  do {
                  } while (u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && u3[++s3] === u3[++r2] && s3 < c3);
                  if (n3 = S - (c3 - s3), s3 = c3 - S, a3 < n3) {
                    if (e3.match_start = t3, o3 <= (a3 = n3)) break;
                    d3 = u3[s3 + a3 - 1], p3 = u3[s3 + a3];
                  }
                }
              } while ((t3 = f3[t3 & l3]) > h4 && 0 != --i2);
              return a3 <= e3.lookahead ? a3 : e3.lookahead;
            }
            function j(e3) {
              var t3, r2, n3, i2, s3, a3, o3, h4, u3, l3, f3 = e3.w_size;
              do {
                if (i2 = e3.window_size - e3.lookahead - e3.strstart, e3.strstart >= f3 + (f3 - z)) {
                  for (c2.arraySet(e3.window, e3.window, f3, f3, 0), e3.match_start -= f3, e3.strstart -= f3, e3.block_start -= f3, t3 = r2 = e3.hash_size; n3 = e3.head[--t3], e3.head[t3] = f3 <= n3 ? n3 - f3 : 0, --r2; ) ;
                  for (t3 = r2 = f3; n3 = e3.prev[--t3], e3.prev[t3] = f3 <= n3 ? n3 - f3 : 0, --r2; ) ;
                  i2 += f3;
                }
                if (0 === e3.strm.avail_in) break;
                if (a3 = e3.strm, o3 = e3.window, h4 = e3.strstart + e3.lookahead, u3 = i2, l3 = void 0, l3 = a3.avail_in, u3 < l3 && (l3 = u3), r2 = 0 === l3 ? 0 : (a3.avail_in -= l3, c2.arraySet(o3, a3.input, a3.next_in, l3, h4), 1 === a3.state.wrap ? a3.adler = d2(a3.adler, o3, l3, h4) : 2 === a3.state.wrap && (a3.adler = p2(a3.adler, o3, l3, h4)), a3.next_in += l3, a3.total_in += l3, l3), e3.lookahead += r2, e3.lookahead + e3.insert >= x) for (s3 = e3.strstart - e3.insert, e3.ins_h = e3.window[s3], e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[s3 + 1]) & e3.hash_mask; e3.insert && (e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[s3 + x - 1]) & e3.hash_mask, e3.prev[s3 & e3.w_mask] = e3.head[e3.ins_h], e3.head[e3.ins_h] = s3, s3++, e3.insert--, !(e3.lookahead + e3.insert < x)); ) ;
              } while (e3.lookahead < z && 0 !== e3.strm.avail_in);
            }
            function Z(e3, t3) {
              for (var r2, n3; ; ) {
                if (e3.lookahead < z) {
                  if (j(e3), e3.lookahead < z && t3 === l2) return A;
                  if (0 === e3.lookahead) break;
                }
                if (r2 = 0, e3.lookahead >= x && (e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[e3.strstart + x - 1]) & e3.hash_mask, r2 = e3.prev[e3.strstart & e3.w_mask] = e3.head[e3.ins_h], e3.head[e3.ins_h] = e3.strstart), 0 !== r2 && e3.strstart - r2 <= e3.w_size - z && (e3.match_length = L(e3, r2)), e3.match_length >= x) if (n3 = u2._tr_tally(e3, e3.strstart - e3.match_start, e3.match_length - x), e3.lookahead -= e3.match_length, e3.match_length <= e3.max_lazy_match && e3.lookahead >= x) {
                  for (e3.match_length--; e3.strstart++, e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[e3.strstart + x - 1]) & e3.hash_mask, r2 = e3.prev[e3.strstart & e3.w_mask] = e3.head[e3.ins_h], e3.head[e3.ins_h] = e3.strstart, 0 != --e3.match_length; ) ;
                  e3.strstart++;
                } else e3.strstart += e3.match_length, e3.match_length = 0, e3.ins_h = e3.window[e3.strstart], e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[e3.strstart + 1]) & e3.hash_mask;
                else n3 = u2._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++;
                if (n3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = e3.strstart < x - 1 ? e3.strstart : x - 1, t3 === f2 ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }
            function W(e3, t3) {
              for (var r2, n3, i2; ; ) {
                if (e3.lookahead < z) {
                  if (j(e3), e3.lookahead < z && t3 === l2) return A;
                  if (0 === e3.lookahead) break;
                }
                if (r2 = 0, e3.lookahead >= x && (e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[e3.strstart + x - 1]) & e3.hash_mask, r2 = e3.prev[e3.strstart & e3.w_mask] = e3.head[e3.ins_h], e3.head[e3.ins_h] = e3.strstart), e3.prev_length = e3.match_length, e3.prev_match = e3.match_start, e3.match_length = x - 1, 0 !== r2 && e3.prev_length < e3.max_lazy_match && e3.strstart - r2 <= e3.w_size - z && (e3.match_length = L(e3, r2), e3.match_length <= 5 && (1 === e3.strategy || e3.match_length === x && 4096 < e3.strstart - e3.match_start) && (e3.match_length = x - 1)), e3.prev_length >= x && e3.match_length <= e3.prev_length) {
                  for (i2 = e3.strstart + e3.lookahead - x, n3 = u2._tr_tally(e3, e3.strstart - 1 - e3.prev_match, e3.prev_length - x), e3.lookahead -= e3.prev_length - 1, e3.prev_length -= 2; ++e3.strstart <= i2 && (e3.ins_h = (e3.ins_h << e3.hash_shift ^ e3.window[e3.strstart + x - 1]) & e3.hash_mask, r2 = e3.prev[e3.strstart & e3.w_mask] = e3.head[e3.ins_h], e3.head[e3.ins_h] = e3.strstart), 0 != --e3.prev_length; ) ;
                  if (e3.match_available = 0, e3.match_length = x - 1, e3.strstart++, n3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
                } else if (e3.match_available) {
                  if ((n3 = u2._tr_tally(e3, 0, e3.window[e3.strstart - 1])) && N(e3, false), e3.strstart++, e3.lookahead--, 0 === e3.strm.avail_out) return A;
                } else e3.match_available = 1, e3.strstart++, e3.lookahead--;
              }
              return e3.match_available && (n3 = u2._tr_tally(e3, 0, e3.window[e3.strstart - 1]), e3.match_available = 0), e3.insert = e3.strstart < x - 1 ? e3.strstart : x - 1, t3 === f2 ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            }
            function M(e3, t3, r2, n3, i2) {
              this.good_length = e3, this.max_lazy = t3, this.nice_length = r2, this.max_chain = n3, this.func = i2;
            }
            function H() {
              this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v3, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c2.Buf16(2 * w2), this.dyn_dtree = new c2.Buf16(2 * (2 * a2 + 1)), this.bl_tree = new c2.Buf16(2 * (2 * o2 + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c2.Buf16(k2 + 1), this.heap = new c2.Buf16(2 * s2 + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c2.Buf16(2 * s2 + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
            }
            function G(e3) {
              var t3;
              return e3 && e3.state ? (e3.total_in = e3.total_out = 0, e3.data_type = i, (t3 = e3.state).pending = 0, t3.pending_out = 0, t3.wrap < 0 && (t3.wrap = -t3.wrap), t3.status = t3.wrap ? C : E, e3.adler = 2 === t3.wrap ? 0 : 1, t3.last_flush = l2, u2._tr_init(t3), m2) : R(e3, _);
            }
            function K(e3) {
              var t3 = G(e3);
              return t3 === m2 && (function(e4) {
                e4.window_size = 2 * e4.w_size, D(e4.head), e4.max_lazy_match = h3[e4.level].max_lazy, e4.good_match = h3[e4.level].good_length, e4.nice_match = h3[e4.level].nice_length, e4.max_chain_length = h3[e4.level].max_chain, e4.strstart = 0, e4.block_start = 0, e4.lookahead = 0, e4.insert = 0, e4.match_length = e4.prev_length = x - 1, e4.match_available = 0, e4.ins_h = 0;
              })(e3.state), t3;
            }
            function Y(e3, t3, r2, n3, i2, s3) {
              if (!e3) return _;
              var a3 = 1;
              if (t3 === g && (t3 = 6), n3 < 0 ? (a3 = 0, n3 = -n3) : 15 < n3 && (a3 = 2, n3 -= 16), i2 < 1 || y2 < i2 || r2 !== v3 || n3 < 8 || 15 < n3 || t3 < 0 || 9 < t3 || s3 < 0 || b2 < s3) return R(e3, _);
              8 === n3 && (n3 = 9);
              var o3 = new H();
              return (e3.state = o3).strm = e3, o3.wrap = a3, o3.gzhead = null, o3.w_bits = n3, o3.w_size = 1 << o3.w_bits, o3.w_mask = o3.w_size - 1, o3.hash_bits = i2 + 7, o3.hash_size = 1 << o3.hash_bits, o3.hash_mask = o3.hash_size - 1, o3.hash_shift = ~~((o3.hash_bits + x - 1) / x), o3.window = new c2.Buf8(2 * o3.w_size), o3.head = new c2.Buf16(o3.hash_size), o3.prev = new c2.Buf16(o3.w_size), o3.lit_bufsize = 1 << i2 + 6, o3.pending_buf_size = 4 * o3.lit_bufsize, o3.pending_buf = new c2.Buf8(o3.pending_buf_size), o3.d_buf = 1 * o3.lit_bufsize, o3.l_buf = 3 * o3.lit_bufsize, o3.level = t3, o3.strategy = s3, o3.method = r2, K(e3);
            }
            h3 = [new M(0, 0, 0, 0, function(e3, t3) {
              var r2 = 65535;
              for (r2 > e3.pending_buf_size - 5 && (r2 = e3.pending_buf_size - 5); ; ) {
                if (e3.lookahead <= 1) {
                  if (j(e3), 0 === e3.lookahead && t3 === l2) return A;
                  if (0 === e3.lookahead) break;
                }
                e3.strstart += e3.lookahead, e3.lookahead = 0;
                var n3 = e3.block_start + r2;
                if ((0 === e3.strstart || e3.strstart >= n3) && (e3.lookahead = e3.strstart - n3, e3.strstart = n3, N(e3, false), 0 === e3.strm.avail_out)) return A;
                if (e3.strstart - e3.block_start >= e3.w_size - z && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f2 ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : (e3.strstart > e3.block_start && (N(e3, false), e3.strm.avail_out), A);
            }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e3, t3) {
              return Y(e3, t3, v3, 15, 8, 0);
            }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e3, t3) {
              return e3 && e3.state ? 2 !== e3.state.wrap ? _ : (e3.state.gzhead = t3, m2) : _;
            }, r.deflate = function(e3, t3) {
              var r2, n3, i2, s3;
              if (!e3 || !e3.state || 5 < t3 || t3 < 0) return e3 ? R(e3, _) : _;
              if (n3 = e3.state, !e3.output || !e3.input && 0 !== e3.avail_in || 666 === n3.status && t3 !== f2) return R(e3, 0 === e3.avail_out ? -5 : _);
              if (n3.strm = e3, r2 = n3.last_flush, n3.last_flush = t3, n3.status === C) if (2 === n3.wrap) e3.adler = 0, U(n3, 31), U(n3, 139), U(n3, 8), n3.gzhead ? (U(n3, (n3.gzhead.text ? 1 : 0) + (n3.gzhead.hcrc ? 2 : 0) + (n3.gzhead.extra ? 4 : 0) + (n3.gzhead.name ? 8 : 0) + (n3.gzhead.comment ? 16 : 0)), U(n3, 255 & n3.gzhead.time), U(n3, n3.gzhead.time >> 8 & 255), U(n3, n3.gzhead.time >> 16 & 255), U(n3, n3.gzhead.time >> 24 & 255), U(n3, 9 === n3.level ? 2 : 2 <= n3.strategy || n3.level < 2 ? 4 : 0), U(n3, 255 & n3.gzhead.os), n3.gzhead.extra && n3.gzhead.extra.length && (U(n3, 255 & n3.gzhead.extra.length), U(n3, n3.gzhead.extra.length >> 8 & 255)), n3.gzhead.hcrc && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending, 0)), n3.gzindex = 0, n3.status = 69) : (U(n3, 0), U(n3, 0), U(n3, 0), U(n3, 0), U(n3, 0), U(n3, 9 === n3.level ? 2 : 2 <= n3.strategy || n3.level < 2 ? 4 : 0), U(n3, 3), n3.status = E);
              else {
                var a3 = v3 + (n3.w_bits - 8 << 4) << 8;
                a3 |= (2 <= n3.strategy || n3.level < 2 ? 0 : n3.level < 6 ? 1 : 6 === n3.level ? 2 : 3) << 6, 0 !== n3.strstart && (a3 |= 32), a3 += 31 - a3 % 31, n3.status = E, P2(n3, a3), 0 !== n3.strstart && (P2(n3, e3.adler >>> 16), P2(n3, 65535 & e3.adler)), e3.adler = 1;
              }
              if (69 === n3.status) if (n3.gzhead.extra) {
                for (i2 = n3.pending; n3.gzindex < (65535 & n3.gzhead.extra.length) && (n3.pending !== n3.pending_buf_size || (n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), F(e3), i2 = n3.pending, n3.pending !== n3.pending_buf_size)); ) U(n3, 255 & n3.gzhead.extra[n3.gzindex]), n3.gzindex++;
                n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), n3.gzindex === n3.gzhead.extra.length && (n3.gzindex = 0, n3.status = 73);
              } else n3.status = 73;
              if (73 === n3.status) if (n3.gzhead.name) {
                i2 = n3.pending;
                do {
                  if (n3.pending === n3.pending_buf_size && (n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), F(e3), i2 = n3.pending, n3.pending === n3.pending_buf_size)) {
                    s3 = 1;
                    break;
                  }
                  s3 = n3.gzindex < n3.gzhead.name.length ? 255 & n3.gzhead.name.charCodeAt(n3.gzindex++) : 0, U(n3, s3);
                } while (0 !== s3);
                n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), 0 === s3 && (n3.gzindex = 0, n3.status = 91);
              } else n3.status = 91;
              if (91 === n3.status) if (n3.gzhead.comment) {
                i2 = n3.pending;
                do {
                  if (n3.pending === n3.pending_buf_size && (n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), F(e3), i2 = n3.pending, n3.pending === n3.pending_buf_size)) {
                    s3 = 1;
                    break;
                  }
                  s3 = n3.gzindex < n3.gzhead.comment.length ? 255 & n3.gzhead.comment.charCodeAt(n3.gzindex++) : 0, U(n3, s3);
                } while (0 !== s3);
                n3.gzhead.hcrc && n3.pending > i2 && (e3.adler = p2(e3.adler, n3.pending_buf, n3.pending - i2, i2)), 0 === s3 && (n3.status = 103);
              } else n3.status = 103;
              if (103 === n3.status && (n3.gzhead.hcrc ? (n3.pending + 2 > n3.pending_buf_size && F(e3), n3.pending + 2 <= n3.pending_buf_size && (U(n3, 255 & e3.adler), U(n3, e3.adler >> 8 & 255), e3.adler = 0, n3.status = E)) : n3.status = E), 0 !== n3.pending) {
                if (F(e3), 0 === e3.avail_out) return n3.last_flush = -1, m2;
              } else if (0 === e3.avail_in && T(t3) <= T(r2) && t3 !== f2) return R(e3, -5);
              if (666 === n3.status && 0 !== e3.avail_in) return R(e3, -5);
              if (0 !== e3.avail_in || 0 !== n3.lookahead || t3 !== l2 && 666 !== n3.status) {
                var o3 = 2 === n3.strategy ? (function(e4, t4) {
                  for (var r3; ; ) {
                    if (0 === e4.lookahead && (j(e4), 0 === e4.lookahead)) {
                      if (t4 === l2) return A;
                      break;
                    }
                    if (e4.match_length = 0, r3 = u2._tr_tally(e4, 0, e4.window[e4.strstart]), e4.lookahead--, e4.strstart++, r3 && (N(e4, false), 0 === e4.strm.avail_out)) return A;
                  }
                  return e4.insert = 0, t4 === f2 ? (N(e4, true), 0 === e4.strm.avail_out ? O : B) : e4.last_lit && (N(e4, false), 0 === e4.strm.avail_out) ? A : I;
                })(n3, t3) : 3 === n3.strategy ? (function(e4, t4) {
                  for (var r3, n4, i3, s4, a4 = e4.window; ; ) {
                    if (e4.lookahead <= S) {
                      if (j(e4), e4.lookahead <= S && t4 === l2) return A;
                      if (0 === e4.lookahead) break;
                    }
                    if (e4.match_length = 0, e4.lookahead >= x && 0 < e4.strstart && (n4 = a4[i3 = e4.strstart - 1]) === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3]) {
                      s4 = e4.strstart + S;
                      do {
                      } while (n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && n4 === a4[++i3] && i3 < s4);
                      e4.match_length = S - (s4 - i3), e4.match_length > e4.lookahead && (e4.match_length = e4.lookahead);
                    }
                    if (e4.match_length >= x ? (r3 = u2._tr_tally(e4, 1, e4.match_length - x), e4.lookahead -= e4.match_length, e4.strstart += e4.match_length, e4.match_length = 0) : (r3 = u2._tr_tally(e4, 0, e4.window[e4.strstart]), e4.lookahead--, e4.strstart++), r3 && (N(e4, false), 0 === e4.strm.avail_out)) return A;
                  }
                  return e4.insert = 0, t4 === f2 ? (N(e4, true), 0 === e4.strm.avail_out ? O : B) : e4.last_lit && (N(e4, false), 0 === e4.strm.avail_out) ? A : I;
                })(n3, t3) : h3[n3.level].func(n3, t3);
                if (o3 !== O && o3 !== B || (n3.status = 666), o3 === A || o3 === O) return 0 === e3.avail_out && (n3.last_flush = -1), m2;
                if (o3 === I && (1 === t3 ? u2._tr_align(n3) : 5 !== t3 && (u2._tr_stored_block(n3, 0, 0, false), 3 === t3 && (D(n3.head), 0 === n3.lookahead && (n3.strstart = 0, n3.block_start = 0, n3.insert = 0))), F(e3), 0 === e3.avail_out)) return n3.last_flush = -1, m2;
              }
              return t3 !== f2 ? m2 : n3.wrap <= 0 ? 1 : (2 === n3.wrap ? (U(n3, 255 & e3.adler), U(n3, e3.adler >> 8 & 255), U(n3, e3.adler >> 16 & 255), U(n3, e3.adler >> 24 & 255), U(n3, 255 & e3.total_in), U(n3, e3.total_in >> 8 & 255), U(n3, e3.total_in >> 16 & 255), U(n3, e3.total_in >> 24 & 255)) : (P2(n3, e3.adler >>> 16), P2(n3, 65535 & e3.adler)), F(e3), 0 < n3.wrap && (n3.wrap = -n3.wrap), 0 !== n3.pending ? m2 : 1);
            }, r.deflateEnd = function(e3) {
              var t3;
              return e3 && e3.state ? (t3 = e3.state.status) !== C && 69 !== t3 && 73 !== t3 && 91 !== t3 && 103 !== t3 && t3 !== E && 666 !== t3 ? R(e3, _) : (e3.state = null, t3 === E ? R(e3, -3) : m2) : _;
            }, r.deflateSetDictionary = function(e3, t3) {
              var r2, n3, i2, s3, a3, o3, h4, u3, l3 = t3.length;
              if (!e3 || !e3.state) return _;
              if (2 === (s3 = (r2 = e3.state).wrap) || 1 === s3 && r2.status !== C || r2.lookahead) return _;
              for (1 === s3 && (e3.adler = d2(e3.adler, t3, l3, 0)), r2.wrap = 0, l3 >= r2.w_size && (0 === s3 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u3 = new c2.Buf8(r2.w_size), c2.arraySet(u3, t3, l3 - r2.w_size, r2.w_size, 0), t3 = u3, l3 = r2.w_size), a3 = e3.avail_in, o3 = e3.next_in, h4 = e3.input, e3.avail_in = l3, e3.next_in = 0, e3.input = t3, j(r2); r2.lookahead >= x; ) {
                for (n3 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n3 + x - 1]) & r2.hash_mask, r2.prev[n3 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n3, n3++, --i2; ) ;
                r2.strstart = n3, r2.lookahead = x - 1, j(r2);
              }
              return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e3.next_in = o3, e3.input = h4, e3.avail_in = a3, r2.wrap = s3, m2;
            }, r.deflateInfo = "pako deflate (from Nodeca project)";
          }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e2, t2, r) {
            t2.exports = function() {
              this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
            };
          }, {}], 48: [function(e2, t2, r) {
            t2.exports = function(e3, t3) {
              var r2, n2, i, s2, a2, o2, h3, u2, l2, f2, c2, d2, p2, m2, _, g, b2, v3, y2, w2, k2, x, S, z, C;
              r2 = e3.state, n2 = e3.next_in, z = e3.input, i = n2 + (e3.avail_in - 5), s2 = e3.next_out, C = e3.output, a2 = s2 - (t3 - e3.avail_out), o2 = s2 + (e3.avail_out - 257), h3 = r2.dmax, u2 = r2.wsize, l2 = r2.whave, f2 = r2.wnext, c2 = r2.window, d2 = r2.hold, p2 = r2.bits, m2 = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b2 = (1 << r2.distbits) - 1;
              e: do {
                p2 < 15 && (d2 += z[n2++] << p2, p2 += 8, d2 += z[n2++] << p2, p2 += 8), v3 = m2[d2 & g];
                t: for (; ; ) {
                  if (d2 >>>= y2 = v3 >>> 24, p2 -= y2, 0 === (y2 = v3 >>> 16 & 255)) C[s2++] = 65535 & v3;
                  else {
                    if (!(16 & y2)) {
                      if (0 == (64 & y2)) {
                        v3 = m2[(65535 & v3) + (d2 & (1 << y2) - 1)];
                        continue t;
                      }
                      if (32 & y2) {
                        r2.mode = 12;
                        break e;
                      }
                      e3.msg = "invalid literal/length code", r2.mode = 30;
                      break e;
                    }
                    w2 = 65535 & v3, (y2 &= 15) && (p2 < y2 && (d2 += z[n2++] << p2, p2 += 8), w2 += d2 & (1 << y2) - 1, d2 >>>= y2, p2 -= y2), p2 < 15 && (d2 += z[n2++] << p2, p2 += 8, d2 += z[n2++] << p2, p2 += 8), v3 = _[d2 & b2];
                    r: for (; ; ) {
                      if (d2 >>>= y2 = v3 >>> 24, p2 -= y2, !(16 & (y2 = v3 >>> 16 & 255))) {
                        if (0 == (64 & y2)) {
                          v3 = _[(65535 & v3) + (d2 & (1 << y2) - 1)];
                          continue r;
                        }
                        e3.msg = "invalid distance code", r2.mode = 30;
                        break e;
                      }
                      if (k2 = 65535 & v3, p2 < (y2 &= 15) && (d2 += z[n2++] << p2, (p2 += 8) < y2 && (d2 += z[n2++] << p2, p2 += 8)), h3 < (k2 += d2 & (1 << y2) - 1)) {
                        e3.msg = "invalid distance too far back", r2.mode = 30;
                        break e;
                      }
                      if (d2 >>>= y2, p2 -= y2, (y2 = s2 - a2) < k2) {
                        if (l2 < (y2 = k2 - y2) && r2.sane) {
                          e3.msg = "invalid distance too far back", r2.mode = 30;
                          break e;
                        }
                        if (S = c2, (x = 0) === f2) {
                          if (x += u2 - y2, y2 < w2) {
                            for (w2 -= y2; C[s2++] = c2[x++], --y2; ) ;
                            x = s2 - k2, S = C;
                          }
                        } else if (f2 < y2) {
                          if (x += u2 + f2 - y2, (y2 -= f2) < w2) {
                            for (w2 -= y2; C[s2++] = c2[x++], --y2; ) ;
                            if (x = 0, f2 < w2) {
                              for (w2 -= y2 = f2; C[s2++] = c2[x++], --y2; ) ;
                              x = s2 - k2, S = C;
                            }
                          }
                        } else if (x += f2 - y2, y2 < w2) {
                          for (w2 -= y2; C[s2++] = c2[x++], --y2; ) ;
                          x = s2 - k2, S = C;
                        }
                        for (; 2 < w2; ) C[s2++] = S[x++], C[s2++] = S[x++], C[s2++] = S[x++], w2 -= 3;
                        w2 && (C[s2++] = S[x++], 1 < w2 && (C[s2++] = S[x++]));
                      } else {
                        for (x = s2 - k2; C[s2++] = C[x++], C[s2++] = C[x++], C[s2++] = C[x++], 2 < (w2 -= 3); ) ;
                        w2 && (C[s2++] = C[x++], 1 < w2 && (C[s2++] = C[x++]));
                      }
                      break;
                    }
                  }
                  break;
                }
              } while (n2 < i && s2 < o2);
              n2 -= w2 = p2 >> 3, d2 &= (1 << (p2 -= w2 << 3)) - 1, e3.next_in = n2, e3.next_out = s2, e3.avail_in = n2 < i ? i - n2 + 5 : 5 - (n2 - i), e3.avail_out = s2 < o2 ? o2 - s2 + 257 : 257 - (s2 - o2), r2.hold = d2, r2.bits = p2;
            };
          }, {}], 49: [function(e2, t2, r) {
            var I = e2("../utils/common"), O = e2("./adler32"), B = e2("./crc32"), R = e2("./inffast"), T = e2("./inftrees"), D = 1, F = 2, N = 0, U = -2, P2 = 1, n2 = 852, i = 592;
            function L(e3) {
              return (e3 >>> 24 & 255) + (e3 >>> 8 & 65280) + ((65280 & e3) << 8) + ((255 & e3) << 24);
            }
            function s2() {
              this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
            }
            function a2(e3) {
              var t3;
              return e3 && e3.state ? (t3 = e3.state, e3.total_in = e3.total_out = t3.total = 0, e3.msg = "", t3.wrap && (e3.adler = 1 & t3.wrap), t3.mode = P2, t3.last = 0, t3.havedict = 0, t3.dmax = 32768, t3.head = null, t3.hold = 0, t3.bits = 0, t3.lencode = t3.lendyn = new I.Buf32(n2), t3.distcode = t3.distdyn = new I.Buf32(i), t3.sane = 1, t3.back = -1, N) : U;
            }
            function o2(e3) {
              var t3;
              return e3 && e3.state ? ((t3 = e3.state).wsize = 0, t3.whave = 0, t3.wnext = 0, a2(e3)) : U;
            }
            function h3(e3, t3) {
              var r2, n3;
              return e3 && e3.state ? (n3 = e3.state, t3 < 0 ? (r2 = 0, t3 = -t3) : (r2 = 1 + (t3 >> 4), t3 < 48 && (t3 &= 15)), t3 && (t3 < 8 || 15 < t3) ? U : (null !== n3.window && n3.wbits !== t3 && (n3.window = null), n3.wrap = r2, n3.wbits = t3, o2(e3))) : U;
            }
            function u2(e3, t3) {
              var r2, n3;
              return e3 ? (n3 = new s2(), (e3.state = n3).window = null, (r2 = h3(e3, t3)) !== N && (e3.state = null), r2) : U;
            }
            var l2, f2, c2 = true;
            function j(e3) {
              if (c2) {
                var t3;
                for (l2 = new I.Buf32(512), f2 = new I.Buf32(32), t3 = 0; t3 < 144; ) e3.lens[t3++] = 8;
                for (; t3 < 256; ) e3.lens[t3++] = 9;
                for (; t3 < 280; ) e3.lens[t3++] = 7;
                for (; t3 < 288; ) e3.lens[t3++] = 8;
                for (T(D, e3.lens, 0, 288, l2, 0, e3.work, { bits: 9 }), t3 = 0; t3 < 32; ) e3.lens[t3++] = 5;
                T(F, e3.lens, 0, 32, f2, 0, e3.work, { bits: 5 }), c2 = false;
              }
              e3.lencode = l2, e3.lenbits = 9, e3.distcode = f2, e3.distbits = 5;
            }
            function Z(e3, t3, r2, n3) {
              var i2, s3 = e3.state;
              return null === s3.window && (s3.wsize = 1 << s3.wbits, s3.wnext = 0, s3.whave = 0, s3.window = new I.Buf8(s3.wsize)), n3 >= s3.wsize ? (I.arraySet(s3.window, t3, r2 - s3.wsize, s3.wsize, 0), s3.wnext = 0, s3.whave = s3.wsize) : (n3 < (i2 = s3.wsize - s3.wnext) && (i2 = n3), I.arraySet(s3.window, t3, r2 - n3, i2, s3.wnext), (n3 -= i2) ? (I.arraySet(s3.window, t3, r2 - n3, n3, 0), s3.wnext = n3, s3.whave = s3.wsize) : (s3.wnext += i2, s3.wnext === s3.wsize && (s3.wnext = 0), s3.whave < s3.wsize && (s3.whave += i2))), 0;
            }
            r.inflateReset = o2, r.inflateReset2 = h3, r.inflateResetKeep = a2, r.inflateInit = function(e3) {
              return u2(e3, 15);
            }, r.inflateInit2 = u2, r.inflate = function(e3, t3) {
              var r2, n3, i2, s3, a3, o3, h4, u3, l3, f3, c3, d2, p2, m2, _, g, b2, v3, y2, w2, k2, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
              if (!e3 || !e3.state || !e3.output || !e3.input && 0 !== e3.avail_in) return U;
              12 === (r2 = e3.state).mode && (r2.mode = 13), a3 = e3.next_out, i2 = e3.output, h4 = e3.avail_out, s3 = e3.next_in, n3 = e3.input, o3 = e3.avail_in, u3 = r2.hold, l3 = r2.bits, f3 = o3, c3 = h4, x = N;
              e: for (; ; ) switch (r2.mode) {
                case P2:
                  if (0 === r2.wrap) {
                    r2.mode = 13;
                    break;
                  }
                  for (; l3 < 16; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if (2 & r2.wrap && 35615 === u3) {
                    E[r2.check = 0] = 255 & u3, E[1] = u3 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l3 = u3 = 0, r2.mode = 2;
                    break;
                  }
                  if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u3) << 8) + (u3 >> 8)) % 31) {
                    e3.msg = "incorrect header check", r2.mode = 30;
                    break;
                  }
                  if (8 != (15 & u3)) {
                    e3.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (l3 -= 4, k2 = 8 + (15 & (u3 >>>= 4)), 0 === r2.wbits) r2.wbits = k2;
                  else if (k2 > r2.wbits) {
                    e3.msg = "invalid window size", r2.mode = 30;
                    break;
                  }
                  r2.dmax = 1 << k2, e3.adler = r2.check = 1, r2.mode = 512 & u3 ? 10 : 12, l3 = u3 = 0;
                  break;
                case 2:
                  for (; l3 < 16; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if (r2.flags = u3, 8 != (255 & r2.flags)) {
                    e3.msg = "unknown compression method", r2.mode = 30;
                    break;
                  }
                  if (57344 & r2.flags) {
                    e3.msg = "unknown header flags set", r2.mode = 30;
                    break;
                  }
                  r2.head && (r2.head.text = u3 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u3, E[1] = u3 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l3 = u3 = 0, r2.mode = 3;
                case 3:
                  for (; l3 < 32; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  r2.head && (r2.head.time = u3), 512 & r2.flags && (E[0] = 255 & u3, E[1] = u3 >>> 8 & 255, E[2] = u3 >>> 16 & 255, E[3] = u3 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l3 = u3 = 0, r2.mode = 4;
                case 4:
                  for (; l3 < 16; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  r2.head && (r2.head.xflags = 255 & u3, r2.head.os = u3 >> 8), 512 & r2.flags && (E[0] = 255 & u3, E[1] = u3 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l3 = u3 = 0, r2.mode = 5;
                case 5:
                  if (1024 & r2.flags) {
                    for (; l3 < 16; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    r2.length = u3, r2.head && (r2.head.extra_len = u3), 512 & r2.flags && (E[0] = 255 & u3, E[1] = u3 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l3 = u3 = 0;
                  } else r2.head && (r2.head.extra = null);
                  r2.mode = 6;
                case 6:
                  if (1024 & r2.flags && (o3 < (d2 = r2.length) && (d2 = o3), d2 && (r2.head && (k2 = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n3, s3, d2, k2)), 512 & r2.flags && (r2.check = B(r2.check, n3, d2, s3)), o3 -= d2, s3 += d2, r2.length -= d2), r2.length)) break e;
                  r2.length = 0, r2.mode = 7;
                case 7:
                  if (2048 & r2.flags) {
                    if (0 === o3) break e;
                    for (d2 = 0; k2 = n3[s3 + d2++], r2.head && k2 && r2.length < 65536 && (r2.head.name += String.fromCharCode(k2)), k2 && d2 < o3; ) ;
                    if (512 & r2.flags && (r2.check = B(r2.check, n3, d2, s3)), o3 -= d2, s3 += d2, k2) break e;
                  } else r2.head && (r2.head.name = null);
                  r2.length = 0, r2.mode = 8;
                case 8:
                  if (4096 & r2.flags) {
                    if (0 === o3) break e;
                    for (d2 = 0; k2 = n3[s3 + d2++], r2.head && k2 && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k2)), k2 && d2 < o3; ) ;
                    if (512 & r2.flags && (r2.check = B(r2.check, n3, d2, s3)), o3 -= d2, s3 += d2, k2) break e;
                  } else r2.head && (r2.head.comment = null);
                  r2.mode = 9;
                case 9:
                  if (512 & r2.flags) {
                    for (; l3 < 16; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    if (u3 !== (65535 & r2.check)) {
                      e3.msg = "header crc mismatch", r2.mode = 30;
                      break;
                    }
                    l3 = u3 = 0;
                  }
                  r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e3.adler = r2.check = 0, r2.mode = 12;
                  break;
                case 10:
                  for (; l3 < 32; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  e3.adler = r2.check = L(u3), l3 = u3 = 0, r2.mode = 11;
                case 11:
                  if (0 === r2.havedict) return e3.next_out = a3, e3.avail_out = h4, e3.next_in = s3, e3.avail_in = o3, r2.hold = u3, r2.bits = l3, 2;
                  e3.adler = r2.check = 1, r2.mode = 12;
                case 12:
                  if (5 === t3 || 6 === t3) break e;
                case 13:
                  if (r2.last) {
                    u3 >>>= 7 & l3, l3 -= 7 & l3, r2.mode = 27;
                    break;
                  }
                  for (; l3 < 3; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  switch (r2.last = 1 & u3, l3 -= 1, 3 & (u3 >>>= 1)) {
                    case 0:
                      r2.mode = 14;
                      break;
                    case 1:
                      if (j(r2), r2.mode = 20, 6 !== t3) break;
                      u3 >>>= 2, l3 -= 2;
                      break e;
                    case 2:
                      r2.mode = 17;
                      break;
                    case 3:
                      e3.msg = "invalid block type", r2.mode = 30;
                  }
                  u3 >>>= 2, l3 -= 2;
                  break;
                case 14:
                  for (u3 >>>= 7 & l3, l3 -= 7 & l3; l3 < 32; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if ((65535 & u3) != (u3 >>> 16 ^ 65535)) {
                    e3.msg = "invalid stored block lengths", r2.mode = 30;
                    break;
                  }
                  if (r2.length = 65535 & u3, l3 = u3 = 0, r2.mode = 15, 6 === t3) break e;
                case 15:
                  r2.mode = 16;
                case 16:
                  if (d2 = r2.length) {
                    if (o3 < d2 && (d2 = o3), h4 < d2 && (d2 = h4), 0 === d2) break e;
                    I.arraySet(i2, n3, s3, d2, a3), o3 -= d2, s3 += d2, h4 -= d2, a3 += d2, r2.length -= d2;
                    break;
                  }
                  r2.mode = 12;
                  break;
                case 17:
                  for (; l3 < 14; ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if (r2.nlen = 257 + (31 & u3), u3 >>>= 5, l3 -= 5, r2.ndist = 1 + (31 & u3), u3 >>>= 5, l3 -= 5, r2.ncode = 4 + (15 & u3), u3 >>>= 4, l3 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                    e3.msg = "too many length or distance symbols", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 18;
                case 18:
                  for (; r2.have < r2.ncode; ) {
                    for (; l3 < 3; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    r2.lens[A[r2.have++]] = 7 & u3, u3 >>>= 3, l3 -= 3;
                  }
                  for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
                  if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    e3.msg = "invalid code lengths set", r2.mode = 30;
                    break;
                  }
                  r2.have = 0, r2.mode = 19;
                case 19:
                  for (; r2.have < r2.nlen + r2.ndist; ) {
                    for (; g = (C = r2.lencode[u3 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b2 = 65535 & C, !((_ = C >>> 24) <= l3); ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    if (b2 < 16) u3 >>>= _, l3 -= _, r2.lens[r2.have++] = b2;
                    else {
                      if (16 === b2) {
                        for (z = _ + 2; l3 < z; ) {
                          if (0 === o3) break e;
                          o3--, u3 += n3[s3++] << l3, l3 += 8;
                        }
                        if (u3 >>>= _, l3 -= _, 0 === r2.have) {
                          e3.msg = "invalid bit length repeat", r2.mode = 30;
                          break;
                        }
                        k2 = r2.lens[r2.have - 1], d2 = 3 + (3 & u3), u3 >>>= 2, l3 -= 2;
                      } else if (17 === b2) {
                        for (z = _ + 3; l3 < z; ) {
                          if (0 === o3) break e;
                          o3--, u3 += n3[s3++] << l3, l3 += 8;
                        }
                        l3 -= _, k2 = 0, d2 = 3 + (7 & (u3 >>>= _)), u3 >>>= 3, l3 -= 3;
                      } else {
                        for (z = _ + 7; l3 < z; ) {
                          if (0 === o3) break e;
                          o3--, u3 += n3[s3++] << l3, l3 += 8;
                        }
                        l3 -= _, k2 = 0, d2 = 11 + (127 & (u3 >>>= _)), u3 >>>= 7, l3 -= 7;
                      }
                      if (r2.have + d2 > r2.nlen + r2.ndist) {
                        e3.msg = "invalid bit length repeat", r2.mode = 30;
                        break;
                      }
                      for (; d2--; ) r2.lens[r2.have++] = k2;
                    }
                  }
                  if (30 === r2.mode) break;
                  if (0 === r2.lens[256]) {
                    e3.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                    break;
                  }
                  if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                    e3.msg = "invalid literal/lengths set", r2.mode = 30;
                    break;
                  }
                  if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                    e3.msg = "invalid distances set", r2.mode = 30;
                    break;
                  }
                  if (r2.mode = 20, 6 === t3) break e;
                case 20:
                  r2.mode = 21;
                case 21:
                  if (6 <= o3 && 258 <= h4) {
                    e3.next_out = a3, e3.avail_out = h4, e3.next_in = s3, e3.avail_in = o3, r2.hold = u3, r2.bits = l3, R(e3, c3), a3 = e3.next_out, i2 = e3.output, h4 = e3.avail_out, s3 = e3.next_in, n3 = e3.input, o3 = e3.avail_in, u3 = r2.hold, l3 = r2.bits, 12 === r2.mode && (r2.back = -1);
                    break;
                  }
                  for (r2.back = 0; g = (C = r2.lencode[u3 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b2 = 65535 & C, !((_ = C >>> 24) <= l3); ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if (g && 0 == (240 & g)) {
                    for (v3 = _, y2 = g, w2 = b2; g = (C = r2.lencode[w2 + ((u3 & (1 << v3 + y2) - 1) >> v3)]) >>> 16 & 255, b2 = 65535 & C, !(v3 + (_ = C >>> 24) <= l3); ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    u3 >>>= v3, l3 -= v3, r2.back += v3;
                  }
                  if (u3 >>>= _, l3 -= _, r2.back += _, r2.length = b2, 0 === g) {
                    r2.mode = 26;
                    break;
                  }
                  if (32 & g) {
                    r2.back = -1, r2.mode = 12;
                    break;
                  }
                  if (64 & g) {
                    e3.msg = "invalid literal/length code", r2.mode = 30;
                    break;
                  }
                  r2.extra = 15 & g, r2.mode = 22;
                case 22:
                  if (r2.extra) {
                    for (z = r2.extra; l3 < z; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    r2.length += u3 & (1 << r2.extra) - 1, u3 >>>= r2.extra, l3 -= r2.extra, r2.back += r2.extra;
                  }
                  r2.was = r2.length, r2.mode = 23;
                case 23:
                  for (; g = (C = r2.distcode[u3 & (1 << r2.distbits) - 1]) >>> 16 & 255, b2 = 65535 & C, !((_ = C >>> 24) <= l3); ) {
                    if (0 === o3) break e;
                    o3--, u3 += n3[s3++] << l3, l3 += 8;
                  }
                  if (0 == (240 & g)) {
                    for (v3 = _, y2 = g, w2 = b2; g = (C = r2.distcode[w2 + ((u3 & (1 << v3 + y2) - 1) >> v3)]) >>> 16 & 255, b2 = 65535 & C, !(v3 + (_ = C >>> 24) <= l3); ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    u3 >>>= v3, l3 -= v3, r2.back += v3;
                  }
                  if (u3 >>>= _, l3 -= _, r2.back += _, 64 & g) {
                    e3.msg = "invalid distance code", r2.mode = 30;
                    break;
                  }
                  r2.offset = b2, r2.extra = 15 & g, r2.mode = 24;
                case 24:
                  if (r2.extra) {
                    for (z = r2.extra; l3 < z; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    r2.offset += u3 & (1 << r2.extra) - 1, u3 >>>= r2.extra, l3 -= r2.extra, r2.back += r2.extra;
                  }
                  if (r2.offset > r2.dmax) {
                    e3.msg = "invalid distance too far back", r2.mode = 30;
                    break;
                  }
                  r2.mode = 25;
                case 25:
                  if (0 === h4) break e;
                  if (d2 = c3 - h4, r2.offset > d2) {
                    if ((d2 = r2.offset - d2) > r2.whave && r2.sane) {
                      e3.msg = "invalid distance too far back", r2.mode = 30;
                      break;
                    }
                    p2 = d2 > r2.wnext ? (d2 -= r2.wnext, r2.wsize - d2) : r2.wnext - d2, d2 > r2.length && (d2 = r2.length), m2 = r2.window;
                  } else m2 = i2, p2 = a3 - r2.offset, d2 = r2.length;
                  for (h4 < d2 && (d2 = h4), h4 -= d2, r2.length -= d2; i2[a3++] = m2[p2++], --d2; ) ;
                  0 === r2.length && (r2.mode = 21);
                  break;
                case 26:
                  if (0 === h4) break e;
                  i2[a3++] = r2.length, h4--, r2.mode = 21;
                  break;
                case 27:
                  if (r2.wrap) {
                    for (; l3 < 32; ) {
                      if (0 === o3) break e;
                      o3--, u3 |= n3[s3++] << l3, l3 += 8;
                    }
                    if (c3 -= h4, e3.total_out += c3, r2.total += c3, c3 && (e3.adler = r2.check = r2.flags ? B(r2.check, i2, c3, a3 - c3) : O(r2.check, i2, c3, a3 - c3)), c3 = h4, (r2.flags ? u3 : L(u3)) !== r2.check) {
                      e3.msg = "incorrect data check", r2.mode = 30;
                      break;
                    }
                    l3 = u3 = 0;
                  }
                  r2.mode = 28;
                case 28:
                  if (r2.wrap && r2.flags) {
                    for (; l3 < 32; ) {
                      if (0 === o3) break e;
                      o3--, u3 += n3[s3++] << l3, l3 += 8;
                    }
                    if (u3 !== (4294967295 & r2.total)) {
                      e3.msg = "incorrect length check", r2.mode = 30;
                      break;
                    }
                    l3 = u3 = 0;
                  }
                  r2.mode = 29;
                case 29:
                  x = 1;
                  break e;
                case 30:
                  x = -3;
                  break e;
                case 31:
                  return -4;
                case 32:
                default:
                  return U;
              }
              return e3.next_out = a3, e3.avail_out = h4, e3.next_in = s3, e3.avail_in = o3, r2.hold = u3, r2.bits = l3, (r2.wsize || c3 !== e3.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t3)) && Z(e3, e3.output, e3.next_out, c3 - e3.avail_out) ? (r2.mode = 31, -4) : (f3 -= e3.avail_in, c3 -= e3.avail_out, e3.total_in += f3, e3.total_out += c3, r2.total += c3, r2.wrap && c3 && (e3.adler = r2.check = r2.flags ? B(r2.check, i2, c3, e3.next_out - c3) : O(r2.check, i2, c3, e3.next_out - c3)), e3.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f3 && 0 === c3 || 4 === t3) && x === N && (x = -5), x);
            }, r.inflateEnd = function(e3) {
              if (!e3 || !e3.state) return U;
              var t3 = e3.state;
              return t3.window && (t3.window = null), e3.state = null, N;
            }, r.inflateGetHeader = function(e3, t3) {
              var r2;
              return e3 && e3.state ? 0 == (2 & (r2 = e3.state).wrap) ? U : ((r2.head = t3).done = false, N) : U;
            }, r.inflateSetDictionary = function(e3, t3) {
              var r2, n3 = t3.length;
              return e3 && e3.state ? 0 !== (r2 = e3.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t3, n3, 0) !== r2.check ? -3 : Z(e3, t3, n3, n3) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
            }, r.inflateInfo = "pako inflate (from Nodeca project)";
          }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e2, t2, r) {
            var D = e2("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P2 = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
            t2.exports = function(e3, t3, r2, n2, i, s2, a2, o2) {
              var h3, u2, l2, f2, c2, d2, p2, m2, _, g = o2.bits, b2 = 0, v3 = 0, y2 = 0, w2 = 0, k2 = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
              for (b2 = 0; b2 <= 15; b2++) O[b2] = 0;
              for (v3 = 0; v3 < n2; v3++) O[t3[r2 + v3]]++;
              for (k2 = g, w2 = 15; 1 <= w2 && 0 === O[w2]; w2--) ;
              if (w2 < k2 && (k2 = w2), 0 === w2) return i[s2++] = 20971520, i[s2++] = 20971520, o2.bits = 1, 0;
              for (y2 = 1; y2 < w2 && 0 === O[y2]; y2++) ;
              for (k2 < y2 && (k2 = y2), b2 = z = 1; b2 <= 15; b2++) if (z <<= 1, (z -= O[b2]) < 0) return -1;
              if (0 < z && (0 === e3 || 1 !== w2)) return -1;
              for (B[1] = 0, b2 = 1; b2 < 15; b2++) B[b2 + 1] = B[b2] + O[b2];
              for (v3 = 0; v3 < n2; v3++) 0 !== t3[r2 + v3] && (a2[B[t3[r2 + v3]]++] = v3);
              if (d2 = 0 === e3 ? (A = R = a2, 19) : 1 === e3 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P2, -1), b2 = y2, c2 = s2, S = v3 = E = 0, l2 = -1, f2 = (C = 1 << (x = k2)) - 1, 1 === e3 && 852 < C || 2 === e3 && 592 < C) return 1;
              for (; ; ) {
                for (p2 = b2 - S, _ = a2[v3] < d2 ? (m2 = 0, a2[v3]) : a2[v3] > d2 ? (m2 = R[T + a2[v3]], A[I + a2[v3]]) : (m2 = 96, 0), h3 = 1 << b2 - S, y2 = u2 = 1 << x; i[c2 + (E >> S) + (u2 -= h3)] = p2 << 24 | m2 << 16 | _ | 0, 0 !== u2; ) ;
                for (h3 = 1 << b2 - 1; E & h3; ) h3 >>= 1;
                if (0 !== h3 ? (E &= h3 - 1, E += h3) : E = 0, v3++, 0 == --O[b2]) {
                  if (b2 === w2) break;
                  b2 = t3[r2 + a2[v3]];
                }
                if (k2 < b2 && (E & f2) !== l2) {
                  for (0 === S && (S = k2), c2 += y2, z = 1 << (x = b2 - S); x + S < w2 && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
                  if (C += 1 << x, 1 === e3 && 852 < C || 2 === e3 && 592 < C) return 1;
                  i[l2 = E & f2] = k2 << 24 | x << 16 | c2 - s2 | 0;
                }
              }
              return 0 !== E && (i[c2 + E] = b2 - S << 24 | 64 << 16 | 0), o2.bits = k2, 0;
            };
          }, { "../utils/common": 41 }], 51: [function(e2, t2, r) {
            t2.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
          }, {}], 52: [function(e2, t2, r) {
            var i = e2("../utils/common"), o2 = 0, h3 = 1;
            function n2(e3) {
              for (var t3 = e3.length; 0 <= --t3; ) e3[t3] = 0;
            }
            var s2 = 0, a2 = 29, u2 = 256, l2 = u2 + 1 + a2, f2 = 30, c2 = 19, _ = 2 * l2 + 1, g = 15, d2 = 16, p2 = 7, m2 = 256, b2 = 16, v3 = 17, y2 = 18, w2 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k2 = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l2 + 2));
            n2(z);
            var C = new Array(2 * f2);
            n2(C);
            var E = new Array(512);
            n2(E);
            var A = new Array(256);
            n2(A);
            var I = new Array(a2);
            n2(I);
            var O, B, R, T = new Array(f2);
            function D(e3, t3, r2, n3, i2) {
              this.static_tree = e3, this.extra_bits = t3, this.extra_base = r2, this.elems = n3, this.max_length = i2, this.has_stree = e3 && e3.length;
            }
            function F(e3, t3) {
              this.dyn_tree = e3, this.max_code = 0, this.stat_desc = t3;
            }
            function N(e3) {
              return e3 < 256 ? E[e3] : E[256 + (e3 >>> 7)];
            }
            function U(e3, t3) {
              e3.pending_buf[e3.pending++] = 255 & t3, e3.pending_buf[e3.pending++] = t3 >>> 8 & 255;
            }
            function P2(e3, t3, r2) {
              e3.bi_valid > d2 - r2 ? (e3.bi_buf |= t3 << e3.bi_valid & 65535, U(e3, e3.bi_buf), e3.bi_buf = t3 >> d2 - e3.bi_valid, e3.bi_valid += r2 - d2) : (e3.bi_buf |= t3 << e3.bi_valid & 65535, e3.bi_valid += r2);
            }
            function L(e3, t3, r2) {
              P2(e3, r2[2 * t3], r2[2 * t3 + 1]);
            }
            function j(e3, t3) {
              for (var r2 = 0; r2 |= 1 & e3, e3 >>>= 1, r2 <<= 1, 0 < --t3; ) ;
              return r2 >>> 1;
            }
            function Z(e3, t3, r2) {
              var n3, i2, s3 = new Array(g + 1), a3 = 0;
              for (n3 = 1; n3 <= g; n3++) s3[n3] = a3 = a3 + r2[n3 - 1] << 1;
              for (i2 = 0; i2 <= t3; i2++) {
                var o3 = e3[2 * i2 + 1];
                0 !== o3 && (e3[2 * i2] = j(s3[o3]++, o3));
              }
            }
            function W(e3) {
              var t3;
              for (t3 = 0; t3 < l2; t3++) e3.dyn_ltree[2 * t3] = 0;
              for (t3 = 0; t3 < f2; t3++) e3.dyn_dtree[2 * t3] = 0;
              for (t3 = 0; t3 < c2; t3++) e3.bl_tree[2 * t3] = 0;
              e3.dyn_ltree[2 * m2] = 1, e3.opt_len = e3.static_len = 0, e3.last_lit = e3.matches = 0;
            }
            function M(e3) {
              8 < e3.bi_valid ? U(e3, e3.bi_buf) : 0 < e3.bi_valid && (e3.pending_buf[e3.pending++] = e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0;
            }
            function H(e3, t3, r2, n3) {
              var i2 = 2 * t3, s3 = 2 * r2;
              return e3[i2] < e3[s3] || e3[i2] === e3[s3] && n3[t3] <= n3[r2];
            }
            function G(e3, t3, r2) {
              for (var n3 = e3.heap[r2], i2 = r2 << 1; i2 <= e3.heap_len && (i2 < e3.heap_len && H(t3, e3.heap[i2 + 1], e3.heap[i2], e3.depth) && i2++, !H(t3, n3, e3.heap[i2], e3.depth)); ) e3.heap[r2] = e3.heap[i2], r2 = i2, i2 <<= 1;
              e3.heap[r2] = n3;
            }
            function K(e3, t3, r2) {
              var n3, i2, s3, a3, o3 = 0;
              if (0 !== e3.last_lit) for (; n3 = e3.pending_buf[e3.d_buf + 2 * o3] << 8 | e3.pending_buf[e3.d_buf + 2 * o3 + 1], i2 = e3.pending_buf[e3.l_buf + o3], o3++, 0 === n3 ? L(e3, i2, t3) : (L(e3, (s3 = A[i2]) + u2 + 1, t3), 0 !== (a3 = w2[s3]) && P2(e3, i2 -= I[s3], a3), L(e3, s3 = N(--n3), r2), 0 !== (a3 = k2[s3]) && P2(e3, n3 -= T[s3], a3)), o3 < e3.last_lit; ) ;
              L(e3, m2, t3);
            }
            function Y(e3, t3) {
              var r2, n3, i2, s3 = t3.dyn_tree, a3 = t3.stat_desc.static_tree, o3 = t3.stat_desc.has_stree, h4 = t3.stat_desc.elems, u3 = -1;
              for (e3.heap_len = 0, e3.heap_max = _, r2 = 0; r2 < h4; r2++) 0 !== s3[2 * r2] ? (e3.heap[++e3.heap_len] = u3 = r2, e3.depth[r2] = 0) : s3[2 * r2 + 1] = 0;
              for (; e3.heap_len < 2; ) s3[2 * (i2 = e3.heap[++e3.heap_len] = u3 < 2 ? ++u3 : 0)] = 1, e3.depth[i2] = 0, e3.opt_len--, o3 && (e3.static_len -= a3[2 * i2 + 1]);
              for (t3.max_code = u3, r2 = e3.heap_len >> 1; 1 <= r2; r2--) G(e3, s3, r2);
              for (i2 = h4; r2 = e3.heap[1], e3.heap[1] = e3.heap[e3.heap_len--], G(e3, s3, 1), n3 = e3.heap[1], e3.heap[--e3.heap_max] = r2, e3.heap[--e3.heap_max] = n3, s3[2 * i2] = s3[2 * r2] + s3[2 * n3], e3.depth[i2] = (e3.depth[r2] >= e3.depth[n3] ? e3.depth[r2] : e3.depth[n3]) + 1, s3[2 * r2 + 1] = s3[2 * n3 + 1] = i2, e3.heap[1] = i2++, G(e3, s3, 1), 2 <= e3.heap_len; ) ;
              e3.heap[--e3.heap_max] = e3.heap[1], (function(e4, t4) {
                var r3, n4, i3, s4, a4, o4, h5 = t4.dyn_tree, u4 = t4.max_code, l3 = t4.stat_desc.static_tree, f3 = t4.stat_desc.has_stree, c3 = t4.stat_desc.extra_bits, d3 = t4.stat_desc.extra_base, p3 = t4.stat_desc.max_length, m3 = 0;
                for (s4 = 0; s4 <= g; s4++) e4.bl_count[s4] = 0;
                for (h5[2 * e4.heap[e4.heap_max] + 1] = 0, r3 = e4.heap_max + 1; r3 < _; r3++) p3 < (s4 = h5[2 * h5[2 * (n4 = e4.heap[r3]) + 1] + 1] + 1) && (s4 = p3, m3++), h5[2 * n4 + 1] = s4, u4 < n4 || (e4.bl_count[s4]++, a4 = 0, d3 <= n4 && (a4 = c3[n4 - d3]), o4 = h5[2 * n4], e4.opt_len += o4 * (s4 + a4), f3 && (e4.static_len += o4 * (l3[2 * n4 + 1] + a4)));
                if (0 !== m3) {
                  do {
                    for (s4 = p3 - 1; 0 === e4.bl_count[s4]; ) s4--;
                    e4.bl_count[s4]--, e4.bl_count[s4 + 1] += 2, e4.bl_count[p3]--, m3 -= 2;
                  } while (0 < m3);
                  for (s4 = p3; 0 !== s4; s4--) for (n4 = e4.bl_count[s4]; 0 !== n4; ) u4 < (i3 = e4.heap[--r3]) || (h5[2 * i3 + 1] !== s4 && (e4.opt_len += (s4 - h5[2 * i3 + 1]) * h5[2 * i3], h5[2 * i3 + 1] = s4), n4--);
                }
              })(e3, t3), Z(s3, u3, e3.bl_count);
            }
            function X(e3, t3, r2) {
              var n3, i2, s3 = -1, a3 = t3[1], o3 = 0, h4 = 7, u3 = 4;
              for (0 === a3 && (h4 = 138, u3 = 3), t3[2 * (r2 + 1) + 1] = 65535, n3 = 0; n3 <= r2; n3++) i2 = a3, a3 = t3[2 * (n3 + 1) + 1], ++o3 < h4 && i2 === a3 || (o3 < u3 ? e3.bl_tree[2 * i2] += o3 : 0 !== i2 ? (i2 !== s3 && e3.bl_tree[2 * i2]++, e3.bl_tree[2 * b2]++) : o3 <= 10 ? e3.bl_tree[2 * v3]++ : e3.bl_tree[2 * y2]++, s3 = i2, u3 = (o3 = 0) === a3 ? (h4 = 138, 3) : i2 === a3 ? (h4 = 6, 3) : (h4 = 7, 4));
            }
            function V(e3, t3, r2) {
              var n3, i2, s3 = -1, a3 = t3[1], o3 = 0, h4 = 7, u3 = 4;
              for (0 === a3 && (h4 = 138, u3 = 3), n3 = 0; n3 <= r2; n3++) if (i2 = a3, a3 = t3[2 * (n3 + 1) + 1], !(++o3 < h4 && i2 === a3)) {
                if (o3 < u3) for (; L(e3, i2, e3.bl_tree), 0 != --o3; ) ;
                else 0 !== i2 ? (i2 !== s3 && (L(e3, i2, e3.bl_tree), o3--), L(e3, b2, e3.bl_tree), P2(e3, o3 - 3, 2)) : o3 <= 10 ? (L(e3, v3, e3.bl_tree), P2(e3, o3 - 3, 3)) : (L(e3, y2, e3.bl_tree), P2(e3, o3 - 11, 7));
                s3 = i2, u3 = (o3 = 0) === a3 ? (h4 = 138, 3) : i2 === a3 ? (h4 = 6, 3) : (h4 = 7, 4);
              }
            }
            n2(T);
            var q = false;
            function J(e3, t3, r2, n3) {
              P2(e3, (s2 << 1) + (n3 ? 1 : 0), 3), (function(e4, t4, r3, n4) {
                M(e4), n4 && (U(e4, r3), U(e4, ~r3)), i.arraySet(e4.pending_buf, e4.window, t4, r3, e4.pending), e4.pending += r3;
              })(e3, t3, r2, true);
            }
            r._tr_init = function(e3) {
              q || ((function() {
                var e4, t3, r2, n3, i2, s3 = new Array(g + 1);
                for (n3 = r2 = 0; n3 < a2 - 1; n3++) for (I[n3] = r2, e4 = 0; e4 < 1 << w2[n3]; e4++) A[r2++] = n3;
                for (A[r2 - 1] = n3, n3 = i2 = 0; n3 < 16; n3++) for (T[n3] = i2, e4 = 0; e4 < 1 << k2[n3]; e4++) E[i2++] = n3;
                for (i2 >>= 7; n3 < f2; n3++) for (T[n3] = i2 << 7, e4 = 0; e4 < 1 << k2[n3] - 7; e4++) E[256 + i2++] = n3;
                for (t3 = 0; t3 <= g; t3++) s3[t3] = 0;
                for (e4 = 0; e4 <= 143; ) z[2 * e4 + 1] = 8, e4++, s3[8]++;
                for (; e4 <= 255; ) z[2 * e4 + 1] = 9, e4++, s3[9]++;
                for (; e4 <= 279; ) z[2 * e4 + 1] = 7, e4++, s3[7]++;
                for (; e4 <= 287; ) z[2 * e4 + 1] = 8, e4++, s3[8]++;
                for (Z(z, l2 + 1, s3), e4 = 0; e4 < f2; e4++) C[2 * e4 + 1] = 5, C[2 * e4] = j(e4, 5);
                O = new D(z, w2, u2 + 1, l2, g), B = new D(C, k2, 0, f2, g), R = new D(new Array(0), x, 0, c2, p2);
              })(), q = true), e3.l_desc = new F(e3.dyn_ltree, O), e3.d_desc = new F(e3.dyn_dtree, B), e3.bl_desc = new F(e3.bl_tree, R), e3.bi_buf = 0, e3.bi_valid = 0, W(e3);
            }, r._tr_stored_block = J, r._tr_flush_block = function(e3, t3, r2, n3) {
              var i2, s3, a3 = 0;
              0 < e3.level ? (2 === e3.strm.data_type && (e3.strm.data_type = (function(e4) {
                var t4, r3 = 4093624447;
                for (t4 = 0; t4 <= 31; t4++, r3 >>>= 1) if (1 & r3 && 0 !== e4.dyn_ltree[2 * t4]) return o2;
                if (0 !== e4.dyn_ltree[18] || 0 !== e4.dyn_ltree[20] || 0 !== e4.dyn_ltree[26]) return h3;
                for (t4 = 32; t4 < u2; t4++) if (0 !== e4.dyn_ltree[2 * t4]) return h3;
                return o2;
              })(e3)), Y(e3, e3.l_desc), Y(e3, e3.d_desc), a3 = (function(e4) {
                var t4;
                for (X(e4, e4.dyn_ltree, e4.l_desc.max_code), X(e4, e4.dyn_dtree, e4.d_desc.max_code), Y(e4, e4.bl_desc), t4 = c2 - 1; 3 <= t4 && 0 === e4.bl_tree[2 * S[t4] + 1]; t4--) ;
                return e4.opt_len += 3 * (t4 + 1) + 5 + 5 + 4, t4;
              })(e3), i2 = e3.opt_len + 3 + 7 >>> 3, (s3 = e3.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s3)) : i2 = s3 = r2 + 5, r2 + 4 <= i2 && -1 !== t3 ? J(e3, t3, r2, n3) : 4 === e3.strategy || s3 === i2 ? (P2(e3, 2 + (n3 ? 1 : 0), 3), K(e3, z, C)) : (P2(e3, 4 + (n3 ? 1 : 0), 3), (function(e4, t4, r3, n4) {
                var i3;
                for (P2(e4, t4 - 257, 5), P2(e4, r3 - 1, 5), P2(e4, n4 - 4, 4), i3 = 0; i3 < n4; i3++) P2(e4, e4.bl_tree[2 * S[i3] + 1], 3);
                V(e4, e4.dyn_ltree, t4 - 1), V(e4, e4.dyn_dtree, r3 - 1);
              })(e3, e3.l_desc.max_code + 1, e3.d_desc.max_code + 1, a3 + 1), K(e3, e3.dyn_ltree, e3.dyn_dtree)), W(e3), n3 && M(e3);
            }, r._tr_tally = function(e3, t3, r2) {
              return e3.pending_buf[e3.d_buf + 2 * e3.last_lit] = t3 >>> 8 & 255, e3.pending_buf[e3.d_buf + 2 * e3.last_lit + 1] = 255 & t3, e3.pending_buf[e3.l_buf + e3.last_lit] = 255 & r2, e3.last_lit++, 0 === t3 ? e3.dyn_ltree[2 * r2]++ : (e3.matches++, t3--, e3.dyn_ltree[2 * (A[r2] + u2 + 1)]++, e3.dyn_dtree[2 * N(t3)]++), e3.last_lit === e3.lit_bufsize - 1;
            }, r._tr_align = function(e3) {
              P2(e3, 2, 3), L(e3, m2, z), (function(e4) {
                16 === e4.bi_valid ? (U(e4, e4.bi_buf), e4.bi_buf = 0, e4.bi_valid = 0) : 8 <= e4.bi_valid && (e4.pending_buf[e4.pending++] = 255 & e4.bi_buf, e4.bi_buf >>= 8, e4.bi_valid -= 8);
              })(e3);
            };
          }, { "../utils/common": 41 }], 53: [function(e2, t2, r) {
            t2.exports = function() {
              this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
            };
          }, {}], 54: [function(e2, t2, r) {
            (function(e3) {
              !(function(r2, n2) {
                if (!r2.setImmediate) {
                  var i, s2, t3, a2, o2 = 1, h3 = {}, u2 = false, l2 = r2.document, e4 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
                  e4 = e4 && e4.setTimeout ? e4 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e5) {
                    process.nextTick(function() {
                      c2(e5);
                    });
                  } : (function() {
                    if (r2.postMessage && !r2.importScripts) {
                      var e5 = true, t4 = r2.onmessage;
                      return r2.onmessage = function() {
                        e5 = false;
                      }, r2.postMessage("", "*"), r2.onmessage = t4, e5;
                    }
                  })() ? (a2 = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d2, false) : r2.attachEvent("onmessage", d2), function(e5) {
                    r2.postMessage(a2 + e5, "*");
                  }) : r2.MessageChannel ? ((t3 = new MessageChannel()).port1.onmessage = function(e5) {
                    c2(e5.data);
                  }, function(e5) {
                    t3.port2.postMessage(e5);
                  }) : l2 && "onreadystatechange" in l2.createElement("script") ? (s2 = l2.documentElement, function(e5) {
                    var t4 = l2.createElement("script");
                    t4.onreadystatechange = function() {
                      c2(e5), t4.onreadystatechange = null, s2.removeChild(t4), t4 = null;
                    }, s2.appendChild(t4);
                  }) : function(e5) {
                    setTimeout(c2, 0, e5);
                  }, e4.setImmediate = function(e5) {
                    "function" != typeof e5 && (e5 = new Function("" + e5));
                    for (var t4 = new Array(arguments.length - 1), r3 = 0; r3 < t4.length; r3++) t4[r3] = arguments[r3 + 1];
                    var n3 = { callback: e5, args: t4 };
                    return h3[o2] = n3, i(o2), o2++;
                  }, e4.clearImmediate = f2;
                }
                function f2(e5) {
                  delete h3[e5];
                }
                function c2(e5) {
                  if (u2) setTimeout(c2, 0, e5);
                  else {
                    var t4 = h3[e5];
                    if (t4) {
                      u2 = true;
                      try {
                        !(function(e6) {
                          var t5 = e6.callback, r3 = e6.args;
                          switch (r3.length) {
                            case 0:
                              t5();
                              break;
                            case 1:
                              t5(r3[0]);
                              break;
                            case 2:
                              t5(r3[0], r3[1]);
                              break;
                            case 3:
                              t5(r3[0], r3[1], r3[2]);
                              break;
                            default:
                              t5.apply(n2, r3);
                          }
                        })(t4);
                      } finally {
                        f2(e5), u2 = false;
                      }
                    }
                  }
                }
                function d2(e5) {
                  e5.source === r2 && "string" == typeof e5.data && 0 === e5.data.indexOf(a2) && c2(+e5.data.slice(a2.length));
                }
              })("undefined" == typeof self ? void 0 === e3 ? this : e3 : self);
            }).call(this, "undefined" != typeof commonjsGlobal ? commonjsGlobal : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
          }, {}] }, {}, [10])(10);
        });
      })(jszip_min);
      e = (() => {
        if ("undefined" == typeof self) return false;
        if ("top" in self && self !== top) try {
          top.window.document._ = 0;
        } catch (e2) {
          return false;
        }
        return "showOpenFilePicker" in self;
      })();
      t = e ? Promise.resolve().then(function() {
        return l;
      }) : Promise.resolve().then(function() {
        return v;
      });
      e ? Promise.resolve().then(function() {
        return y;
      }) : Promise.resolve().then(function() {
        return b;
      });
      a = e ? Promise.resolve().then(function() {
        return m;
      }) : Promise.resolve().then(function() {
        return k;
      });
      s = async (e2) => {
        const t2 = await e2.getFile();
        return t2.handle = e2, t2;
      };
      c = async (e2 = [{}]) => {
        Array.isArray(e2) || (e2 = [e2]);
        const t2 = [];
        e2.forEach((e3, n3) => {
          t2[n3] = { description: e3.description || "Files", accept: {} }, e3.mimeTypes ? e3.mimeTypes.map((r2) => {
            t2[n3].accept[r2] = e3.extensions || [];
          }) : t2[n3].accept["*/*"] = e3.extensions || [];
        });
        const n2 = await window.showOpenFilePicker({ id: e2[0].id, startIn: e2[0].startIn, types: t2, multiple: e2[0].multiple || false, excludeAcceptAllOption: e2[0].excludeAcceptAllOption || false }), r = await Promise.all(n2.map(s));
        return e2[0].multiple ? r : r[0];
      };
      l = { __proto__: null, default: c };
      p = async (e2, t2, n2 = e2.name, r) => {
        const i = [], a2 = [];
        var o2, s2 = false, c2 = false;
        try {
          for (var l2, d2 = (function(e3) {
            var t3, n3, r2, i2 = 2;
            for ("undefined" != typeof Symbol && (n3 = Symbol.asyncIterator, r2 = Symbol.iterator); i2--; ) {
              if (n3 && null != (t3 = e3[n3])) return t3.call(e3);
              if (r2 && null != (t3 = e3[r2])) return new u(t3.call(e3));
              n3 = "@@asyncIterator", r2 = "@@iterator";
            }
            throw new TypeError("Object is not async iterable");
          })(e2.values()); s2 = !(l2 = await d2.next()).done; s2 = false) {
            const o3 = l2.value, s3 = `${n2}/${o3.name}`;
            "file" === o3.kind ? a2.push(o3.getFile().then((t3) => (t3.directoryHandle = e2, t3.handle = o3, Object.defineProperty(t3, "webkitRelativePath", { configurable: true, enumerable: true, get: () => s3 })))) : "directory" !== o3.kind || !t2 || r && r(o3) || i.push(p(o3, t2, s3, r));
          }
        } catch (e3) {
          c2 = true, o2 = e3;
        } finally {
          try {
            s2 && null != d2.return && await d2.return();
          } finally {
            if (c2) throw o2;
          }
        }
        return [...(await Promise.all(i)).flat(), ...await Promise.all(a2)];
      };
      d = async (e2 = {}) => {
        e2.recursive = e2.recursive || false, e2.mode = e2.mode || "read";
        const t2 = await window.showDirectoryPicker({ id: e2.id, startIn: e2.startIn, mode: e2.mode });
        return (await (await t2.values()).next()).done ? [t2] : p(t2, e2.recursive, void 0, e2.skipDirectory);
      };
      y = { __proto__: null, default: d };
      f = async (e2, t2 = [{}], n2 = null, r = false, i = null) => {
        Array.isArray(t2) || (t2 = [t2]), t2[0].fileName = t2[0].fileName || "Untitled";
        const a2 = [];
        let o2 = null;
        if (e2 instanceof Blob && e2.type ? o2 = e2.type : e2.headers && e2.headers.get("content-type") && (o2 = e2.headers.get("content-type")), t2.forEach((e3, t3) => {
          a2[t3] = { description: e3.description || "Files", accept: {} }, e3.mimeTypes ? (0 === t3 && o2 && e3.mimeTypes.push(o2), e3.mimeTypes.map((n3) => {
            a2[t3].accept[n3] = e3.extensions || [];
          })) : o2 ? a2[t3].accept[o2] = e3.extensions || [] : a2[t3].accept["*/*"] = e3.extensions || [];
        }), n2) try {
          await n2.getFile();
        } catch (e3) {
          if (n2 = null, r) throw e3;
        }
        const s2 = n2 || await window.showSaveFilePicker({ suggestedName: t2[0].fileName, id: t2[0].id, startIn: t2[0].startIn, types: a2, excludeAcceptAllOption: t2[0].excludeAcceptAllOption || false });
        !n2 && i && i(s2);
        const c2 = await s2.createWritable();
        if ("stream" in e2) {
          const t3 = e2.stream();
          return await t3.pipeTo(c2), s2;
        }
        return "body" in e2 ? (await e2.body.pipeTo(c2), s2) : (await c2.write(await e2), await c2.close(), s2);
      };
      m = { __proto__: null, default: f };
      w = async (e2 = [{}]) => (Array.isArray(e2) || (e2 = [e2]), new Promise((t2, n2) => {
        const r = document.createElement("input");
        r.type = "file";
        const i = [...e2.map((e3) => e3.mimeTypes || []), ...e2.map((e3) => e3.extensions || [])].join();
        r.multiple = e2[0].multiple || false, r.accept = i || "", r.style.display = "none", document.body.append(r);
        const a2 = (e3) => {
          "function" == typeof o2 && o2(), t2(e3);
        }, o2 = e2[0].legacySetup && e2[0].legacySetup(a2, () => o2(n2), r), s2 = () => {
          window.removeEventListener("focus", s2), r.remove();
        };
        r.addEventListener("click", () => {
          window.addEventListener("focus", s2);
        }), r.addEventListener("change", () => {
          window.removeEventListener("focus", s2), r.remove(), a2(r.multiple ? Array.from(r.files) : r.files[0]);
        }), "showPicker" in HTMLInputElement.prototype ? r.showPicker() : r.click();
      }));
      v = { __proto__: null, default: w };
      h = async (e2 = [{}]) => (Array.isArray(e2) || (e2 = [e2]), e2[0].recursive = e2[0].recursive || false, new Promise((t2, n2) => {
        const r = document.createElement("input");
        r.type = "file", r.webkitdirectory = true;
        const i = (e3) => {
          "function" == typeof a2 && a2(), t2(e3);
        }, a2 = e2[0].legacySetup && e2[0].legacySetup(i, () => a2(n2), r);
        r.addEventListener("change", () => {
          let t3 = Array.from(r.files);
          e2[0].recursive ? e2[0].recursive && e2[0].skipDirectory && (t3 = t3.filter((t4) => t4.webkitRelativePath.split("/").every((t5) => !e2[0].skipDirectory({ name: t5, kind: "directory" })))) : t3 = t3.filter((e3) => 2 === e3.webkitRelativePath.split("/").length), i(t3);
        }), "showPicker" in HTMLInputElement.prototype ? r.showPicker() : r.click();
      }));
      b = { __proto__: null, default: h };
      P = async (e2, t2 = {}) => {
        Array.isArray(t2) && (t2 = t2[0]);
        const n2 = document.createElement("a");
        let r = e2;
        "body" in e2 && (r = await (async function(e3, t3) {
          const n3 = e3.getReader(), r2 = new ReadableStream({ start: (e4) => (async function t4() {
            return n3.read().then(({ done: n4, value: r3 }) => {
              if (!n4) return e4.enqueue(r3), t4();
              e4.close();
            });
          })() }), i2 = new Response(r2), a3 = await i2.blob();
          return n3.releaseLock(), new Blob([a3], { type: t3 });
        })(e2.body, e2.headers.get("content-type"))), n2.download = t2.fileName || "Untitled", n2.href = URL.createObjectURL(await r);
        const i = () => {
          "function" == typeof a2 && a2();
        }, a2 = t2.legacySetup && t2.legacySetup(i, () => a2(), n2);
        return n2.addEventListener("click", () => {
          setTimeout(() => URL.revokeObjectURL(n2.href), 3e4), i();
        }), n2.click(), null;
      };
      k = { __proto__: null, default: P };
      jeepSqliteCss = ":host{display:block;--jeep-sqlite-top:10%;--jeep-sqlite-right:1%;--jeep-sqlite-font-size:2em;--jeep-sqlite-padding:2%;--jeep-sqlite-background-color:#a9a9a9;--jeep-sqlite-color:#ffffff}#fileElem{display:none}#pickButton{position:absolute;top:var(--jeep-sqlite-top);right:var(--jeep-sqlite-right);font-size:var(--jeep-sqlite-font-size);padding:var(--jeep-sqlite-padding);background-color:var(--jeep-sqlite-background-color);color:var(--jeep-sqlite-color)}#saveButton{position:absolute;top:var(--jeep-sqlite-top);right:var(--jeep-sqlite-right);font-size:var(--jeep-sqlite-font-size);padding:var(--jeep-sqlite-padding);background-color:var(--jeep-sqlite-background-color);color:var(--jeep-sqlite-color)}";
      JeepSqliteStyle0 = jeepSqliteCss;
      JeepSqlite = class {
        constructor(hostRef) {
          registerInstance(this, hostRef);
          this.importProgress = createEvent(this, "jeepSqliteImportProgress", 7);
          this.exportProgress = createEvent(this, "jeepSqliteExportProgress", 7);
          this.HTTPRequestEnded = createEvent(this, "jeepSqliteHTTPRequestEnded", 7);
          this.PickDatabaseEnded = createEvent(this, "jeepSqlitePickDatabaseEnded", 7);
          this.SaveDatabaseEnded = createEvent(this, "jeepSqliteSaveDatabaseToDisk", 7);
          this.isStore = false;
          this._dbDict = {};
          this.databaseList = {};
          this._versionUpgrades = {};
          this._overwrite = true;
          this.autoSave = false;
          this.typeOrm = false;
          this.wasmPath = void 0;
          this.pickText = void 0;
          this.saveText = void 0;
          this.buttonOptions = void 0;
          this.innerAutoSave = void 0;
          this.innerTypeOrm = void 0;
          this.innerWasmPath = void 0;
          this.innerPickText = void 0;
          this.innerSaveText = void 0;
          this.innerButtonOptions = void 0;
        }
        //*****************************
        //* Watch on Property Changes *
        //*****************************
        parseAutoSave(newValue) {
          this.innerAutoSave = newValue;
        }
        parseTypeOrm(newValue) {
          this.innerTypeOrm = newValue;
        }
        parseWasmPath(newValue) {
          this.innerWasmPath = newValue;
        }
        parsePickText(newValue) {
          this.innerPickText = newValue;
        }
        parseSaveText(newValue) {
          this.innerSaveText = newValue;
        }
        parseButtonOptions(newValue) {
          this.innerButtonOptions = JSON.parse(newValue);
          const keys = Object.keys(this.innerButtonOptions);
          for (const key of keys) {
            switch (key) {
              case "top": {
                this.el.style.setProperty("--jeep-sqlite-top", this.innerButtonOptions[key]);
                break;
              }
              case "right": {
                this.el.style.setProperty("--jeep-sqlite-right", this.innerButtonOptions[key]);
                break;
              }
              case "fontSize": {
                this.el.style.setProperty("--jeep-sqlite-font-size", this.innerButtonOptions[key]);
                break;
              }
              case "padding": {
                this.el.style.setProperty("--jeep-sqlite-padding", this.innerButtonOptions[key]);
                break;
              }
              case "backgroundColor": {
                this.el.style.setProperty("--jeep-sqlite-background-color", this.innerButtonOptions[key]);
                break;
              }
              case "color": {
                this.el.style.setProperty("--jeep-sqlite-color", this.innerButtonOptions[key]);
                break;
              }
            }
          }
        }
        //**********************
        //* Method Definitions *
        //**********************
        async echo(options) {
          return options;
        }
        async createConnection(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const version2 = options.version ? options.version : 1;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._createConnection(dbName, version2, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isConnection(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          const ret = await this._isConnection(dbName, readonly);
          return Promise.resolve(ret);
        }
        async closeConnection(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._closeConnection(dbName, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async open(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._open(dbName, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async close(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._close(dbName, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getVersion(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const res = await this._getVersion(dbName, readonly);
            return Promise.resolve(res);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async beginTransaction(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          if (readonly) {
            return Promise.reject(`BeginTransaction: not allowed in read-only mode`);
          }
          try {
            const changes = await this._beginTransaction(dbName);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async commitTransaction(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          if (readonly) {
            return Promise.reject(`CommitTransaction: not allowed in read-only mode`);
          }
          try {
            const changes = await this._commitTransaction(dbName);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async rollbackTransaction(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          if (readonly) {
            return Promise.reject(`BeginTransaction: not allowed in read-only mode`);
          }
          try {
            const changes = await this._rollbackTransaction(dbName);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isTransactionActive(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          if (readonly) {
            return Promise.reject(`isTransactionActive: not allowed in read-only mode`);
          }
          try {
            const res = await this._isTransactionActive(dbName);
            return Promise.resolve(res);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async execute(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("statements") || options.statements.length === 0) {
            return Promise.reject("Must provide raw SQL statements");
          }
          const dbName = options.database;
          const statements = options.statements;
          let transaction = true;
          const readonly = options.readonly ? options.readonly : false;
          if (keys.includes("transaction"))
            transaction = options.transaction;
          try {
            const changes = await this._execute(dbName, statements, transaction, readonly);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async executeSet(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("set") || options.set.length === 0) {
            return Promise.reject("Must provide a non-empty set of SQL statements");
          }
          const dbName = options.database;
          const setOfStatements = options.set;
          let transaction = true;
          if (keys.includes("transaction"))
            transaction = options.transaction;
          const readonly = options.readonly ? options.readonly : false;
          const returnMode = options.returnMode ? options.returnMode : "no";
          try {
            const changes = await this._executeSet(dbName, setOfStatements, transaction, readonly, returnMode);
            return Promise.resolve(changes);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async run(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("statement") || options.statement.length === 0) {
            return Promise.reject("Must provide a run statement");
          }
          const dbName = options.database;
          const statement = options.statement;
          let values = [];
          if (keys.includes("values")) {
            values = options.values.length > 0 ? options.values : [];
          }
          let transaction = true;
          if (keys.includes("transaction"))
            transaction = options.transaction;
          const readonly = options.readonly ? options.readonly : false;
          const returnMode = options.returnMode ? options.returnMode : "no";
          try {
            const retChanges = await this._run(dbName, statement, values, transaction, readonly, returnMode);
            return Promise.resolve(retChanges);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async query(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("statement") || options.statement.length === 0) {
            return Promise.reject("Must provide a query statement");
          }
          let values = [];
          if (keys.includes("values")) {
            values = options.values.length > 0 ? options.values : [];
          }
          const dbName = options.database;
          const statement = options.statement;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const retValues = await this._query(dbName, statement, values, readonly);
            return Promise.resolve(retValues);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getTableList(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const retValues = await this._getTableList(dbName, readonly);
            return Promise.resolve(retValues);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isDBExists(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._isDBExists(dbName, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isDBOpen(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._isDBOpen(dbName, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async deleteDatabase(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            return await this._deleteDatabase(dbName, readonly);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isStoreOpen() {
          return Promise.resolve(this.isStore);
        }
        async copyFromAssets(options) {
          let overwrite;
          if (options != null) {
            const keys = Object.keys(options);
            overwrite = keys.includes("overwrite") ? options.overwrite : true;
          } else {
            overwrite = true;
          }
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          try {
            await this._copyFromAssets(overwrite);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isTableExists(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          if (!keys.includes("table")) {
            return Promise.reject("Must provide a table name");
          }
          const tableName = options.table;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._isTableExists(dbName, tableName, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async createSyncTable(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._createSyncTable(dbName, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getSyncDate(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._getSyncDate(dbName, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async setSyncDate(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("syncdate")) {
            return Promise.reject("Must provide a synchronization date");
          }
          const dbName = options.database;
          const syncDate = options.syncdate;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._setSyncDate(dbName, syncDate, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async isJsonValid(options) {
          const keys = Object.keys(options);
          if (!keys.includes("jsonstring")) {
            return Promise.reject("Must provide a json object");
          }
          const jsonStrObj = options.jsonstring;
          try {
            const ret = await this._isJsonValid(jsonStrObj);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async importFromJson(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("jsonstring")) {
            return Promise.reject("Must provide a json object");
          }
          const jsonStrObj = options.jsonstring;
          try {
            const ret = await this._importFromJson(jsonStrObj);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async exportToJson(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("jsonexportmode")) {
            return Promise.reject("Must provide a json export mode");
          }
          const dbName = options.database;
          const exportMode = options.jsonexportmode;
          const readonly = options.readonly ? options.readonly : false;
          try {
            const ret = await this._exportToJson(dbName, exportMode, readonly);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async deleteExportedRows(options) {
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._deleteExportedRows(dbName, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async addUpgradeStatement(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          if (!keys.includes("upgrade")) {
            return Promise.reject("Must provide an upgrade capSQLiteVersionUpgrade Object");
          }
          const dbName = options.database;
          const upgrades = options.upgrade;
          for (const upgrade of upgrades) {
            const versionUpgradeKeys = Object.keys(upgrade);
            if (!versionUpgradeKeys.includes("toVersion") || !versionUpgradeKeys.includes("statements")) {
              return Promise.reject("Must provide an upgrade capSQLiteVersionUpgrade Object");
            }
            if (typeof upgrade.toVersion != "number") {
              return Promise.reject("upgrade.toVersion must be a number");
            }
            if (this._versionUpgrades[dbName]) {
              this._versionUpgrades[dbName][upgrade.toVersion] = upgrade;
            } else {
              const upgVDict = {};
              upgVDict[upgrade.toVersion] = upgrade;
              this._versionUpgrades[dbName] = upgVDict;
            }
          }
          return Promise.resolve();
        }
        async isDatabase(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          try {
            const ret = await this._isDatabase(dbName);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getDatabaseList() {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          try {
            const ret = await this._getDatabaseList();
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async checkConnectionsConsistency(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("dbNames")) {
            return Promise.reject(`Must provide a list of connection's name`);
          }
          const dbNames = options.dbNames;
          if (!keys.includes("openModes")) {
            return Promise.reject(`Must provide a list of connection's open mode`);
          }
          const openModes = options.openModes;
          try {
            const ret = await this._checkConnectionsConsistency(dbNames, openModes);
            return Promise.resolve(ret);
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async saveToStore(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          const readonly = options.readonly ? options.readonly : false;
          try {
            await this._saveToStore(dbName, readonly);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async saveToLocalDisk(options) {
          const keys = Object.keys(options);
          if (!keys.includes("database")) {
            return Promise.reject("Must provide a database name");
          }
          const dbName = options.database;
          try {
            await this._saveToLocalDisk(dbName);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getFromLocalDiskToStore(options) {
          const overwrite = options.overwrite ? options.overwrite : true;
          if (e) {
            console.log("Using the File System Access API.");
          } else {
            console.log("Using the fallback implementation.");
          }
          try {
            await this._getFromLocalDiskToStore(overwrite);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        async getFromHTTPRequest(options) {
          if (!this.isStore) {
            return Promise.reject(`>>> jeep-sqlite StoreName: ${this.storeName} is not opened`);
          }
          let keys = Object.keys(options);
          if (!keys.includes("url")) {
            return Promise.reject("Must provide an url");
          }
          const url = options.url;
          const overwrite = options.overwrite ? options.overwrite : true;
          try {
            await this._getFromHTTPRequest(url, overwrite);
            return Promise.resolve();
          } catch (err2) {
            return Promise.reject(err2);
          }
        }
        //*******************************
        //* Component Lifecycle Methods *
        //*******************************
        connectedCallback() {
          this.parseAutoSave(this.autoSave !== void 0 ? this.autoSave : false);
          this.parseTypeOrm(this.typeOrm !== void 0 ? this.typeOrm : false);
          this.parseWasmPath(this.wasmPath !== void 0 ? this.wasmPath : "/assets");
          this.parseSaveText(this.saveText !== void 0 ? this.saveText : "Save");
          this.parsePickText(this.pickText !== void 0 ? this.pickText : "Pick a database");
          if (this.buttonOptions !== void 0) {
            this.parseButtonOptions(this.buttonOptions);
          }
          this.openStore("jeepSqliteStore", "databases").then((mStore) => {
            this.isStore = mStore;
          });
        }
        componentWillLoad() {
        }
        async componentDidLoad() {
          this._element = this.el.shadowRoot;
          if (!this.isStore) {
            console.log("jeep-sqlite isStore = false");
          }
        }
        //******************************
        //* Private Method Definitions *
        //******************************
        async _createConnection(database, version2, readonly) {
          let upgDict = {};
          const vUpgKeys = Object.keys(this._versionUpgrades);
          if (vUpgKeys.length !== 0 && vUpgKeys.includes(database)) {
            upgDict = this._versionUpgrades[database];
          }
          const dbDictKeys = Object.keys(this._dbDict);
          let mDB;
          try {
            if (dbDictKeys.length > 0 && (dbDictKeys.includes("RW_" + database) || dbDictKeys.includes("RO_" + database))) {
              mDB = dbDictKeys.includes("RW_" + database) ? this._dbDict["RW_" + database] : this._dbDict["RO_" + database];
            } else {
              mDB = new Database(database + "SQLite.db", version2, upgDict, this.store, this.innerAutoSave, this.innerWasmPath);
            }
            const connName = readonly ? "RO_" + database : "RW_" + database;
            this._dbDict[connName] = mDB;
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(msg);
          }
        }
        async _isConnection(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (keys.includes(connName)) {
            return { result: true };
          } else {
            return { result: false };
          }
        }
        async _closeConnection(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`CloseConnection: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          try {
            if (mDB.isDBOpen()) {
              await mDB.close();
            }
            delete this._dbDict[connName];
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`CloseConnection: ${msg}`);
          }
        }
        async _open(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Open: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          try {
            await mDB.open();
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Open: ${msg}`);
          }
        }
        async _close(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Close: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`Close: ${database} database not opened`);
          }
          try {
            await mDB.close();
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Close: ${msg}`);
          }
        }
        async _saveToStore(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`SaveToStore: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`SaveToStore: ${database} database not opened`);
          }
          try {
            await mDB.saveToStore();
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`SaveToStore: ${msg}`);
          }
        }
        async _saveToLocalDisk(database) {
          try {
            const keys = Object.keys(this._dbDict);
            const connName = "RW_" + database;
            if (!keys.includes(connName)) {
              return Promise.reject(`SaveToLocalDisk: No available connection for ${database}`);
            }
            const mDB = this._dbDict[connName];
            if (!mDB.isDBOpen()) {
              return Promise.reject(`SaveToLocalDisk: ${database} database not opened`);
            }
            const uint = await mDB.exportDB();
            this._blob = await this.uint2blob(uint);
            const dbName = `${database}SQLite.db`;
            this._opts = { fileName: dbName, extensions: [".db"], startIn: "documents" };
            this._buttonSaveEl = document.createElement("button");
            this._buttonSaveEl.setAttribute("id", `saveButton`);
            this._buttonSaveEl.innerHTML = `${this.innerSaveText} ${dbName}`;
            this._element.appendChild(this._buttonSaveEl);
            this._buttonSaveEl.addEventListener("click", this.saveFile.bind(this));
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`SaveToLocalDisk: ${msg}`);
          }
        }
        async _getFromLocalDiskToStore(overwrite) {
          this._buttonPickEl = document.createElement("button");
          this._buttonPickEl.setAttribute("id", "pickButton");
          this._buttonPickEl.innerHTML = `${this.innerPickText}`;
          this._element.appendChild(this._buttonPickEl);
          this._buttonPickEl.addEventListener("click", this.pickDatabase.bind(this));
          this._overwrite = overwrite;
          return Promise.resolve();
        }
        async pickDatabase() {
          try {
            const blob = await n({ extensions: [".db"] });
            let uInt8Array = await this.blob2uint(blob);
            const databaseName = this.removePathSuffix(blob.name);
            const dbName = this.setPathSuffix(blob.name);
            const isExist = await UtilsStore.isDBInStore(dbName, this.store);
            if (!isExist) {
              await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
            } else {
              if (this._overwrite) {
                await UtilsStore.removeDBFromStore(dbName, this.store);
                await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
              } else {
                this.PickDatabaseEnded.emit({ message: `Error: cannot overwrite ${dbName}` });
              }
            }
            this._element.removeChild(this._buttonPickEl);
            this.PickDatabaseEnded.emit({ db_name: databaseName });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            this.PickDatabaseEnded.emit({ message: msg });
          }
        }
        async saveFile() {
          try {
            await o(this._blob, [this._opts]);
            const databaseName = this._opts.fileName;
            this._element.removeChild(this._buttonSaveEl);
            this.SaveDatabaseEnded.emit({ db_name: databaseName });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            this.SaveDatabaseEnded.emit({ message: msg });
          }
        }
        async _getVersion(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Open: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`GetVersion: ${database} database not opened`);
          }
          try {
            const version2 = await mDB.getVersion();
            const ret = {};
            ret.version = version2;
            return Promise.resolve(ret);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Open: ${msg}`);
          }
        }
        async _beginTransaction(database) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`BeginTransaction: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`BeginTransaction: ${database} database not opened`);
          }
          let changes = {};
          const ret = await mDB.beginTransaction();
          changes = { changes: { changes: ret } };
          return Promise.resolve(changes);
        }
        async _commitTransaction(database) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`CommitTransaction: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`CommitTransaction: ${database} database not opened`);
          }
          let changes = {};
          const ret = await mDB.commitTransaction();
          changes = { changes: { changes: ret } };
          return Promise.resolve(changes);
        }
        async _rollbackTransaction(database) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`RollbackTransaction: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`RollbackTransaction: ${database} database not opened`);
          }
          let changes = {};
          const ret = await mDB.rollbackTransaction();
          changes = { changes: { changes: ret } };
          return Promise.resolve(changes);
        }
        async _isTransactionActive(database) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`IsTransactionActive: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`IsTransactionActive: ${database} database not opened`);
          }
          let result = {};
          const res = mDB.isTransActive();
          result = { result: res };
          return Promise.resolve(result);
        }
        async _execute(database, statements, transaction, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Execute: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`Execute: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`Execute: not allowed in read-only mode`);
          }
          let changes = {};
          const command = statements.substring(0, 6);
          if (this.innerAutoSave && command === "COMMIT" && this.innerTypeOrm) {
            changes = { changes: { changes: 0 } };
            return Promise.resolve(changes);
          }
          try {
            const ret = await mDB.executeSQL(statements, transaction);
            changes = { changes: { changes: ret } };
            return Promise.resolve(changes);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Execute: ${msg}`);
          }
        }
        async _executeSet(database, setOfStatements, transaction, readonly, returnMode) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`ExecuteSet: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`ExecuteSet: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`ExecuteSet: not allowed in read-only mode`);
          }
          for (const sStmt of setOfStatements) {
            if (!("statement" in sStmt) || !("values" in sStmt)) {
              return Promise.reject("ExecuteSet: Must provide a set as Array of {statement,values}");
            }
          }
          try {
            const ret = await mDB.execSet(setOfStatements, transaction, returnMode);
            const changes = { changes: {
              changes: ret.changes,
              lastId: ret.lastId,
              values: ret.values
            } };
            return Promise.resolve(changes);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`ExecuteSet: ${msg}`);
          }
        }
        async _run(database, statement, values, transaction, readonly, returnMode) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Run: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`Run: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`Run: not allowed in read-only mode`);
          }
          let changes = {};
          const command = statement.substring(0, 6);
          if (this.innerAutoSave && command === "COMMIT") {
            changes = { changes: { changes: 0 } };
            return Promise.resolve(changes);
          }
          try {
            const ret = await mDB.runSQL(statement, values, transaction, returnMode);
            changes = { changes: { changes: ret.changes, lastId: ret.lastId, values: ret.values } };
            return Promise.resolve(changes);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Run: ${msg}`);
          }
        }
        async _query(database, statement, values, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`Query: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`Query: ${database} database not opened`);
          }
          let ret = [];
          const command = statement.substring(0, 6);
          if (this.innerAutoSave && command === "COMMIT") {
            return Promise.resolve({ values: ret });
          }
          try {
            ret = await mDB.selectSQL(statement, values);
            return Promise.resolve({ values: ret });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`Query failed: ${msg}`);
          }
        }
        async _getTableList(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`GetTableList: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`GetTableList: ${database} database not opened`);
          }
          let ret = [];
          try {
            ret = await mDB.getTableNames();
            return Promise.resolve({ values: ret });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`GetTableList failed: ${msg}`);
          }
        }
        async _isDBExists(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`IsDBExists: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          try {
            const ret = await mDB.isDBExists(database + "SQLite.db");
            const result = { result: ret };
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`IsDBExists: ${msg}`);
          }
        }
        async _isDBOpen(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`IsDBOpen: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            const result = { result: false };
            return Promise.resolve(result);
          }
          try {
            const ret = await mDB.isDBOpen(database + "SQLite.db");
            const result = { result: ret };
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`IsDBOpen: ${msg}`);
          }
        }
        async _deleteDatabase(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`DeleteDatabase: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (readonly) {
            return Promise.reject(`DeleteDatabase: not allowed in read-only mode`);
          }
          try {
            await mDB.deleteDB(database + "SQLite.db");
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`DeleteDatabase: ${msg}`);
          }
        }
        async _isTableExists(database, table, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`IsTableExists: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`IsTableExists: ${database} database not opened`);
          }
          try {
            const ret = await mDB.isTable(table);
            const result = { result: ret };
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`IsTableExists: ${msg}`);
          }
        }
        async _createSyncTable(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`CreateSyncTable: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`CreateSyncTable: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`CreateSyncTable: not allowed in read-only mode`);
          }
          try {
            const ret = await mDB.createSyncTable();
            return Promise.resolve({ changes: { changes: ret } });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`CreateSyncTable: ${msg}`);
          }
        }
        async _getSyncDate(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`GetSyncDate: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`GetSyncDate: ${database} database not opened`);
          }
          try {
            const ret = await mDB.getSyncDate();
            return Promise.resolve({ syncDate: ret });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`GetSyncDate: ${msg}`);
          }
        }
        async _setSyncDate(database, syncDate, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`SetSyncDate: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`SetSyncDate: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`SetSyncDate: not allowed in read-only mode`);
          }
          try {
            const ret = await mDB.setSyncDate(syncDate);
            if (ret.result) {
              return Promise.resolve();
            } else {
              return Promise.reject(`SetSyncDate: ${ret.message}`);
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`SetSyncDate: ${msg}`);
          }
        }
        async _isJsonValid(jsonStrObj) {
          const jsonObj = JSON.parse(jsonStrObj);
          const isValid = await UtilsJSON.isJsonSQLite(jsonObj);
          if (!isValid) {
            return Promise.reject("IsJsonValid: Stringify Json Object not Valid");
          } else {
            return Promise.resolve({ result: true });
          }
        }
        async _importFromJson(jsonStrObj) {
          var _a, _b;
          const jsonObj = JSON.parse(jsonStrObj);
          const isValid = await UtilsJSON.isJsonSQLite(jsonObj);
          if (!isValid) {
            return Promise.reject("ImportFromJson: Stringify Json Object not Valid");
          }
          const vJsonObj = jsonObj;
          const dbName = `${vJsonObj.database}SQLite.db`;
          const dbVersion = (_a = vJsonObj.version) !== null && _a !== void 0 ? _a : 1;
          const mode = vJsonObj.mode;
          const overwrite = (_b = vJsonObj.overwrite) !== null && _b !== void 0 ? _b : false;
          const mDb = new Database(dbName, dbVersion, {}, this.store, this.innerAutoSave, this.innerWasmPath);
          try {
            if (overwrite && mode === "full") {
              const isExists = UtilsStore.isDBInStore(dbName, this.store);
              if (isExists) {
                await UtilsStore.removeDBFromStore(dbName, this.store);
              }
            }
            await mDb.open();
            const tableList = await mDb.getTableNames();
            if (mode === "full" && tableList.length > 0) {
              const curVersion = await mDb.getVersion();
              if (dbVersion < curVersion) {
                return Promise.reject(`ImportFromJson: Cannot import a version lower than ${curVersion}`);
              }
              if (curVersion === dbVersion) {
                return Promise.resolve({ changes: { changes: 0 } });
              }
            }
            const changes = await mDb.importJson(vJsonObj, this.importProgress);
            await mDb.close();
            return Promise.resolve({ changes: { changes } });
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`ImportFromJson: ${msg}`);
          }
        }
        async _exportToJson(database, exportMode, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = readonly ? "RO_" + database : "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`ExportToJson: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`ExportToJson: ${database} database not opened`);
          }
          try {
            const ret = await mDB.exportJson(exportMode, this.exportProgress);
            const keys2 = Object.keys(ret);
            if (keys2.includes("message")) {
              return Promise.reject(`ExportToJson: ${ret.message}`);
            } else {
              return Promise.resolve({ export: ret });
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`ExportToJson: ${msg}`);
          }
        }
        async _deleteExportedRows(database, readonly) {
          const keys = Object.keys(this._dbDict);
          const connName = "RW_" + database;
          if (!keys.includes(connName)) {
            return Promise.reject(`DeleteExportedRows: No available connection for ${database}`);
          }
          const mDB = this._dbDict[connName];
          if (!mDB.isDBOpen()) {
            return Promise.reject(`DeleteExportedRows: ${database} database not opened`);
          }
          if (readonly) {
            return Promise.reject(`DeleteExportedRows: not allowed in read-only mode`);
          }
          try {
            await mDB.deleteExportedRows();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`DeleteExportedRows: ${msg}`);
          }
        }
        async _copyFromAssets(overwrite) {
          const res = await this.loadJSON("/assets/databases/databases.json");
          if (res != null) {
            this.databaseList = JSON.parse(res);
            const keys = Object.keys(this.databaseList);
            if (keys.includes("databaseList")) {
              try {
                for (const dbName of this.databaseList.databaseList) {
                  if (dbName.substring(dbName.length - 3) === ".db") {
                    await this.copyDatabase(`/assets/databases/${dbName}`, overwrite);
                  }
                  if (dbName.substring(dbName.length - 4) === ".zip") {
                    await this.unzipDatabase(`/assets/databases/${dbName}`, overwrite);
                  }
                }
                return Promise.resolve();
              } catch (err2) {
                const msg = err2.message ? err2.message : err2;
                return Promise.reject(`CopyFromAssets: ${msg}`);
              }
            } else {
              return Promise.reject(`CopyFromAssets: no key databaseList in databases.json`);
            }
          } else {
            return Promise.reject(`CopyFromAssets: no databases.json file in /assets/databases folder`);
          }
        }
        async _getFromHTTPRequest(url, overwrite) {
          try {
            const extension = this.getFileExtensionInUrl(url);
            let message;
            switch (extension) {
              case "db":
                await this.copyDatabase(url, overwrite);
                message = "db";
                break;
              case "zip":
                await this.unzipDatabase(url, overwrite);
                message = "zip";
                break;
              default:
                message = "Unknown file type in url.";
            }
            this.HTTPRequestEnded.emit({ message });
            return Promise.resolve();
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`GetFromHTTPRequest: ${msg}`);
          }
        }
        async _isDatabase(database) {
          try {
            const ret = await UtilsStore.isDBInStore(database + "SQLite.db", this.store);
            const result = { result: ret };
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`IsDatabase: ${msg}`);
          }
        }
        async _getDatabaseList() {
          try {
            const ret = await UtilsStore.getDBListFromStore(this.store);
            const result = { values: ret };
            return Promise.resolve(result);
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`GetDatabaseList: ${msg}`);
          }
        }
        async _checkConnectionsConsistency(dbNames, openModes) {
          const ret = {};
          ret.result = false;
          const dbConns = [];
          dbNames.forEach((value, i) => {
            dbConns.push(`${openModes[i]}_${value}`);
          });
          try {
            let inConnectionsSet = new Set(Object.keys(this._dbDict));
            const outConnectionSet = new Set(dbConns);
            if (outConnectionSet.size === 0) {
              await this._resetDbDict(Object.keys(this._dbDict));
              return Promise.resolve(ret);
            }
            if (inConnectionsSet.size < outConnectionSet.size) {
              await this._resetDbDict(Object.keys(this._dbDict));
              return Promise.resolve(ret);
            }
            if (inConnectionsSet.size > outConnectionSet.size) {
              const opt = {};
              for (const key of inConnectionsSet) {
                if (!Array.from(outConnectionSet.keys()).includes(key)) {
                  let readonly = false;
                  if (key.substring(0, 3) === "RO_") {
                    readonly = true;
                  }
                  opt.database = key.substring(3);
                  opt.readonly = readonly;
                  await this._closeConnection(opt.database, opt.readonly);
                }
              }
            }
            inConnectionsSet = new Set(Object.keys(this._dbDict));
            if (inConnectionsSet.size === outConnectionSet.size) {
              const symDiffSet = await this.symmetricDifference(inConnectionsSet, outConnectionSet);
              if (symDiffSet.size === 0) {
                ret.result = true;
                return Promise.resolve(ret);
              } else {
                await this._resetDbDict(Object.keys(this._dbDict));
                return Promise.resolve(ret);
              }
            } else {
              await this._resetDbDict(Object.keys(this._dbDict));
              return Promise.resolve(ret);
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`CheckConnectionsConsistency: ${msg}`);
          }
        }
        async _resetDbDict(keys) {
          try {
            for (const key of keys) {
              const opt = {};
              let readonly = false;
              if (key.substring(0, 3) === "RO_") {
                readonly = true;
              }
              opt.database = key.substring(3);
              opt.readonly = readonly;
              await this._closeConnection(opt.database, opt.readonly);
            }
          } catch (err2) {
            const msg = err2.message ? err2.message : err2;
            return Promise.reject(`ResetDbDict: ${msg}`);
          }
        }
        async symmetricDifference(setA, setB) {
          let _difference = /* @__PURE__ */ new Set();
          setA.forEach((element) => {
            _difference.add(element.substring(3));
          });
          let _compare = /* @__PURE__ */ new Set();
          setB.forEach((element) => {
            _compare.add(element.substring(3));
          });
          for (const elem of _compare) {
            if (_difference.has(elem)) {
              _difference.delete(elem);
            } else {
              _difference.add(elem);
            }
          }
          return _difference;
        }
        async unzipDatabase(dbZipName, overwrite) {
          return new Promise((resolve2, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", dbZipName, true);
            xhr.responseType = "arraybuffer";
            xhr.onerror = () => {
              reject(new Error(`unzipDatabase: failed`));
            };
            xhr.onload = () => {
              jszip_min.exports.loadAsync(xhr.response).then(async (zip) => {
                const keys = Object.keys(zip.files);
                try {
                  for (const filename of keys) {
                    await this.retrieveDBFromZip(zip.files, filename, overwrite);
                  }
                  resolve2();
                } catch (err2) {
                  const msg = err2.message ? err2.message : err2;
                  reject(new Error(`unzipDatabase Error: ${msg}`));
                }
              });
            };
            xhr.send();
          });
        }
        async retrieveDBFromZip(zipFiles, fileName, overwrite) {
          return new Promise((resolve2, reject) => {
            zipFiles[fileName].async("nodebuffer").then(async (fileData) => {
              try {
                const uInt8Array = new Uint8Array(fileData);
                const dbName = this.setPathSuffix(fileName);
                const isExist = await UtilsStore.isDBInStore(dbName, this.store);
                if (!isExist) {
                  await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
                } else {
                  if (overwrite) {
                    await UtilsStore.removeDBFromStore(dbName, this.store);
                    await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
                  } else {
                    reject(new Error(`retrieveDBFromZip: cannot overwrite ${dbName}`));
                  }
                }
                resolve2();
              } catch (err2) {
                const msg = err2.message ? err2.message : err2;
                reject(new Error(`retrieveDBFromZip:: ${msg}`));
              }
            });
          });
        }
        async copyDatabase(dbInName, overwrite) {
          return new Promise((resolve2, reject) => {
            var xhr = new XMLHttpRequest();
            var uInt8Array;
            xhr.open("GET", dbInName, true);
            xhr.responseType = "arraybuffer";
            xhr.onerror = () => {
              reject(new Error(`CopyDatabase: failed`));
            };
            xhr.onload = () => {
              uInt8Array = new Uint8Array(xhr.response);
            };
            xhr.onloadend = async () => {
              const dbName = this.setPathSuffix(dbInName);
              const isExist = await UtilsStore.isDBInStore(dbName, this.store);
              if (!isExist) {
                await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
              } else {
                if (overwrite) {
                  await UtilsStore.removeDBFromStore(dbName, this.store);
                  await UtilsStore.saveDBToStore(dbName, uInt8Array, this.store);
                } else {
                  reject(new Error(`CopyDatabase Error: cannot overwrite ${dbName}`));
                }
              }
              resolve2();
            };
            xhr.send();
          });
        }
        async loadJSON(jsonFileName) {
          return new Promise((resolve2, reject) => {
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open("GET", jsonFileName, true);
            xobj.onerror = () => {
              reject(new Error(`LoadJSON: failed`));
            };
            xobj.onreadystatechange = function() {
              if (xobj.status == 404)
                resolve2(null);
              if (xobj.readyState == 4 && xobj.status == 200) {
                resolve2(xobj.responseText);
              }
            };
            xobj.send(null);
          });
        }
        async openStore(dbName, tableName) {
          let ret = false;
          const config2 = this.setConfig(dbName, tableName);
          this.store = localForage.createInstance(config2);
          if (this.store != null) {
            this.storeName = dbName;
            ret = true;
          }
          return ret;
        }
        setConfig(dbName, tableName) {
          const config2 = {
            name: dbName,
            storeName: tableName,
            driver: [localForage.INDEXEDDB],
            version: 1
          };
          return config2;
        }
        removePathSuffix(db2) {
          return db2.includes("SQLite.db") ? db2.split("SQLite.db")[0] : db2.substring(db2.length - 3) === ".db" ? db2.slice(0, db2.lastIndexOf(".")) : db2;
        }
        setPathSuffix(db2) {
          let toDb = db2.slice(db2.lastIndexOf("/") + 1);
          const ext = ".db";
          if (db2.substring(db2.length - 3) === ext) {
            if (!db2.includes("SQLite.db")) {
              toDb = db2.slice(db2.lastIndexOf("/") + 1, -3) + "SQLite.db";
            }
          }
          return toDb;
        }
        async blob2uint(blob) {
          return new Response(blob).arrayBuffer().then((buffer) => {
            const uint = new Uint8Array(buffer);
            return uint;
          });
        }
        async uint2blob(uint) {
          const blob = new Blob([uint.buffer]);
          return Promise.resolve(blob);
        }
        getFileExtensionInUrl(url) {
          const matches = url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
          if (matches) {
            return matches[1].toLowerCase();
          }
          return null;
        }
        render() {
          return;
        }
        static get assetsDirs() {
          return ["assets"];
        }
        get el() {
          return getElement(this);
        }
        static get watchers() {
          return {
            "autoSave": ["parseAutoSave"],
            "typeOrm": ["parseTypeOrm"],
            "wasmPath": ["parseWasmPath"],
            "pickText": ["parsePickText"],
            "saveText": ["parseSaveText"],
            "buttonOptions": ["parseButtonOptions"]
          };
        }
      };
      JeepSqlite.style = JeepSqliteStyle0;
    }
  });

  // import("./**/*.entry.js") in node_modules/jeep-sqlite/dist/esm/index-68ac790b.js
  var globImport_entry_js;
  var init_ = __esm({
    'import("./**/*.entry.js") in node_modules/jeep-sqlite/dist/esm/index-68ac790b.js'() {
      globImport_entry_js = __glob({
        "./jeep-sqlite.entry.js": () => Promise.resolve().then(() => (init_jeep_sqlite_entry(), jeep_sqlite_entry_exports))
      });
    }
  });

  // node_modules/jeep-sqlite/dist/esm/index-68ac790b.js
  function queryNonceMetaTagContent(doc2) {
    var _a, _b, _c;
    return (_c = (_b = (_a = doc2.head) == null ? void 0 : _a.querySelector('meta[name="csp-nonce"]')) == null ? void 0 : _b.getAttribute("content")) != null ? _c : void 0;
  }
  function map(result, fn) {
    if (result.isOk) {
      const val = fn(result.value);
      if (val instanceof Promise) {
        return val.then((newVal) => ok(newVal));
      } else {
        return ok(val);
      }
    }
    if (result.isErr) {
      const value = result.value;
      return err(value);
    }
    throw "should never get here";
  }
  function sortedAttrNames(attrNames) {
    return attrNames.includes("ref") ? (
      // we need to sort these to ensure that `'ref'` is the last attr
      [...attrNames.filter((attr) => attr !== "ref"), "ref"]
    ) : (
      // no need to sort, return the original array
      attrNames
    );
  }
  var NAMESPACE, BUILD, __defProp2, __export2, hostRefs, getHostRef, registerInstance, registerHost, isMemberInElement, consoleError, cmpModules, loadModule, styles, HYDRATED_CSS, SLOT_FB_CSS, win, doc, plt, promiseResolve, supportsConstructableStylesheets, queuePending, queueDomReads, queueDomWrites, queueTask, consume, flush, nextTick2, writeTask, EMPTY_OBJ, isDef, isComplexType, result_exports, ok, err, unwrap, unwrapErr, createTime, uniqueTime, h2, newVNode, Host, isHost, parsePropertyValue, getElement, createEvent, emitEvent, rootAppliedStyles, registerStyle, addStyle, attachStyles, getScopeId, setAccessor, updateElement, scopeId, hostTagName, useNativeShadowDom, isSvgMode, createElm, addVnodes, removeVnodes, updateChildren, isSameVnode, patch, insertBefore, renderVdom, attachToAncestor, scheduleUpdate, dispatchHooks, enqueue, isPromisey, updateComponent, callRender, postUpdateComponent, appDidLoad, safeCall, addHydratedFlag, getValue, setValue, proxyComponent, initializeComponent, fireConnectedCallback, connectedCallback, disconnectInstance, disconnectedCallback, bootstrapLazy;
  var init_index_68ac790b = __esm({
    "node_modules/jeep-sqlite/dist/esm/index-68ac790b.js"() {
      /* @vite-ignore */
      /* webpackInclude: /\.entry\.js$/ */
      /* webpackExclude: /\.system\.entry\.js$/ */
      /* webpackMode: "lazy" */
      init_();
      NAMESPACE = "jeep-sqlite";
      BUILD = /* jeep-sqlite */
      { allRenderFn: true, appendChildSlotFix: false, asyncLoading: true, asyncQueue: false, attachStyles: true, cloneNodeFix: false, cmpDidLoad: true, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: true, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: true, constructableCSS: true, cssAnnotations: true, devTools: false, disconnectedCallback: false, element: false, event: true, experimentalScopedSlotChanges: false, experimentalSlotFixes: false, formAssociated: false, hasRenderFn: true, hostListener: false, hostListenerTarget: false, hostListenerTargetBody: false, hostListenerTargetDocument: false, hostListenerTargetParent: false, hostListenerTargetWindow: false, hotModuleReplacement: false, hydrateClientSide: false, hydrateServerSide: false, hydratedAttribute: false, hydratedClass: true, hydratedSelectorName: "hydrated", initializeNextTick: false, invisiblePrehydration: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: true, lifecycleDOMEvents: false, member: true, method: true, mode: false, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: false, propNumber: false, propString: true, reflect: true, scoped: false, scopedSlotTextContentFix: false, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, slot: false, slotChildNodesFix: false, slotRelocation: false, state: true, style: true, svg: false, taskQueue: true, transformTagName: false, updatable: true, vdomAttribute: true, vdomClass: false, vdomFunctional: false, vdomKey: false, vdomListener: false, vdomPropOrAttr: true, vdomRef: false, vdomRender: false, vdomStyle: false, vdomText: false, vdomXlink: false, watchCallback: true };
      __defProp2 = Object.defineProperty;
      __export2 = (target, all) => {
        for (var name in all)
          __defProp2(target, name, { get: all[name], enumerable: true });
      };
      hostRefs = /* @__PURE__ */ new WeakMap();
      getHostRef = (ref) => hostRefs.get(ref);
      registerInstance = (lazyInstance, hostRef) => hostRefs.set(hostRef.$lazyInstance$ = lazyInstance, hostRef);
      registerHost = (hostElement, cmpMeta) => {
        const hostRef = {
          $flags$: 0,
          $hostElement$: hostElement,
          $cmpMeta$: cmpMeta,
          $instanceValues$: /* @__PURE__ */ new Map()
        };
        {
          hostRef.$onInstancePromise$ = new Promise((r) => hostRef.$onInstanceResolve$ = r);
        }
        {
          hostRef.$onReadyPromise$ = new Promise((r) => hostRef.$onReadyResolve$ = r);
          hostElement["s-p"] = [];
          hostElement["s-rc"] = [];
        }
        return hostRefs.set(hostElement, hostRef);
      };
      isMemberInElement = (elm, memberName) => memberName in elm;
      consoleError = (e2, el) => (0, console.error)(e2, el);
      cmpModules = /* @__PURE__ */ new Map();
      loadModule = (cmpMeta, hostRef, hmrVersionId) => {
        const exportName = cmpMeta.$tagName$.replace(/-/g, "_");
        const bundleId = cmpMeta.$lazyBundleId$;
        if (!bundleId) {
          return void 0;
        }
        const module = cmpModules.get(bundleId);
        if (module) {
          return module[exportName];
        }
        if (!hmrVersionId || !BUILD.hotModuleReplacement) {
          const processMod = (importedModule) => {
            cmpModules.set(bundleId, importedModule);
            return importedModule[exportName];
          };
          switch (bundleId) {
            case "jeep-sqlite":
              return Promise.resolve().then(() => (init_jeep_sqlite_entry(), jeep_sqlite_entry_exports)).then(processMod, consoleError);
          }
        }
        return globImport_entry_js(`./${bundleId}.entry.js${""}`).then((importedModule) => {
          {
            cmpModules.set(bundleId, importedModule);
          }
          return importedModule[exportName];
        }, consoleError);
      };
      styles = /* @__PURE__ */ new Map();
      HYDRATED_CSS = "{visibility:hidden}.hydrated{visibility:inherit}";
      SLOT_FB_CSS = "slot-fb{display:contents}slot-fb[hidden]{display:none}";
      win = typeof window !== "undefined" ? window : {};
      doc = win.document || { head: {} };
      plt = {
        $flags$: 0,
        $resourcesUrl$: "",
        jmp: (h22) => h22(),
        raf: (h22) => requestAnimationFrame(h22),
        ael: (el, eventName, listener, opts) => el.addEventListener(eventName, listener, opts),
        rel: (el, eventName, listener, opts) => el.removeEventListener(eventName, listener, opts),
        ce: (eventName, opts) => new CustomEvent(eventName, opts)
      };
      promiseResolve = (v3) => Promise.resolve(v3);
      supportsConstructableStylesheets = /* @__PURE__ */ (() => {
        try {
          new CSSStyleSheet();
          return typeof new CSSStyleSheet().replaceSync === "function";
        } catch (e2) {
        }
        return false;
      })();
      queuePending = false;
      queueDomReads = [];
      queueDomWrites = [];
      queueTask = (queue2, write3) => (cb) => {
        queue2.push(cb);
        if (!queuePending) {
          queuePending = true;
          if (write3 && plt.$flags$ & 4) {
            nextTick2(flush);
          } else {
            plt.raf(flush);
          }
        }
      };
      consume = (queue2) => {
        for (let i2 = 0; i2 < queue2.length; i2++) {
          try {
            queue2[i2](performance.now());
          } catch (e2) {
            consoleError(e2);
          }
        }
        queue2.length = 0;
      };
      flush = () => {
        consume(queueDomReads);
        {
          consume(queueDomWrites);
          if (queuePending = queueDomReads.length > 0) {
            plt.raf(flush);
          }
        }
      };
      nextTick2 = (cb) => promiseResolve().then(cb);
      writeTask = /* @__PURE__ */ queueTask(queueDomWrites, true);
      EMPTY_OBJ = {};
      isDef = (v3) => v3 != null;
      isComplexType = (o2) => {
        o2 = typeof o2;
        return o2 === "object" || o2 === "function";
      };
      result_exports = {};
      __export2(result_exports, {
        err: () => err,
        map: () => map,
        ok: () => ok,
        unwrap: () => unwrap,
        unwrapErr: () => unwrapErr
      });
      ok = (value) => ({
        isOk: true,
        isErr: false,
        value
      });
      err = (value) => ({
        isOk: false,
        isErr: true,
        value
      });
      unwrap = (result) => {
        if (result.isOk) {
          return result.value;
        } else {
          throw result.value;
        }
      };
      unwrapErr = (result) => {
        if (result.isErr) {
          return result.value;
        } else {
          throw result.value;
        }
      };
      createTime = (fnName, tagName = "") => {
        {
          return () => {
            return;
          };
        }
      };
      uniqueTime = (key, measureText) => {
        {
          return () => {
            return;
          };
        }
      };
      h2 = (nodeName, vnodeData, ...children) => {
        let child = null;
        let simple = false;
        let lastSimple = false;
        const vNodeChildren = [];
        const walk = (c2) => {
          for (let i2 = 0; i2 < c2.length; i2++) {
            child = c2[i2];
            if (Array.isArray(child)) {
              walk(child);
            } else if (child != null && typeof child !== "boolean") {
              if (simple = typeof nodeName !== "function" && !isComplexType(child)) {
                child = String(child);
              }
              if (simple && lastSimple) {
                vNodeChildren[vNodeChildren.length - 1].$text$ += child;
              } else {
                vNodeChildren.push(simple ? newVNode(null, child) : child);
              }
              lastSimple = simple;
            }
          }
        };
        walk(children);
        const vnode = newVNode(nodeName, null);
        vnode.$attrs$ = vnodeData;
        if (vNodeChildren.length > 0) {
          vnode.$children$ = vNodeChildren;
        }
        return vnode;
      };
      newVNode = (tag, text) => {
        const vnode = {
          $flags$: 0,
          $tag$: tag,
          $text$: text,
          $elm$: null,
          $children$: null
        };
        {
          vnode.$attrs$ = null;
        }
        return vnode;
      };
      Host = {};
      isHost = (node) => node && node.$tag$ === Host;
      parsePropertyValue = (propValue, propType) => {
        if (propValue != null && !isComplexType(propValue)) {
          if (propType & 4) {
            return propValue === "false" ? false : propValue === "" || !!propValue;
          }
          if (propType & 1) {
            return String(propValue);
          }
          return propValue;
        }
        return propValue;
      };
      getElement = (ref) => getHostRef(ref).$hostElement$;
      createEvent = (ref, name, flags) => {
        const elm = getElement(ref);
        return {
          emit: (detail) => {
            return emitEvent(elm, name, {
              bubbles: !!(flags & 4),
              composed: !!(flags & 2),
              cancelable: !!(flags & 1),
              detail
            });
          }
        };
      };
      emitEvent = (elm, name, opts) => {
        const ev = plt.ce(name, opts);
        elm.dispatchEvent(ev);
        return ev;
      };
      rootAppliedStyles = /* @__PURE__ */ new WeakMap();
      registerStyle = (scopeId2, cssText, allowCS) => {
        let style = styles.get(scopeId2);
        if (supportsConstructableStylesheets && allowCS) {
          style = style || new CSSStyleSheet();
          if (typeof style === "string") {
            style = cssText;
          } else {
            style.replaceSync(cssText);
          }
        } else {
          style = cssText;
        }
        styles.set(scopeId2, style);
      };
      addStyle = (styleContainerNode, cmpMeta, mode) => {
        var _a;
        const scopeId2 = getScopeId(cmpMeta);
        const style = styles.get(scopeId2);
        styleContainerNode = styleContainerNode.nodeType === 11 ? styleContainerNode : doc;
        if (style) {
          if (typeof style === "string") {
            styleContainerNode = styleContainerNode.head || styleContainerNode;
            let appliedStyles = rootAppliedStyles.get(styleContainerNode);
            let styleElm;
            if (!appliedStyles) {
              rootAppliedStyles.set(styleContainerNode, appliedStyles = /* @__PURE__ */ new Set());
            }
            if (!appliedStyles.has(scopeId2)) {
              {
                styleElm = doc.createElement("style");
                styleElm.innerHTML = style;
                const nonce = (_a = plt.$nonce$) != null ? _a : queryNonceMetaTagContent(doc);
                if (nonce != null) {
                  styleElm.setAttribute("nonce", nonce);
                }
                const injectStyle = (
                  /**
                   * we render a scoped component
                   */
                  !(cmpMeta.$flags$ & 1) || /**
                  * we are using shadow dom and render the style tag within the shadowRoot
                  */
                  cmpMeta.$flags$ & 1 && styleContainerNode.nodeName !== "HEAD"
                );
                if (injectStyle) {
                  styleContainerNode.insertBefore(styleElm, styleContainerNode.querySelector("link"));
                }
              }
              if (cmpMeta.$flags$ & 4) {
                styleElm.innerHTML += SLOT_FB_CSS;
              }
              if (appliedStyles) {
                appliedStyles.add(scopeId2);
              }
            }
          } else if (!styleContainerNode.adoptedStyleSheets.includes(style)) {
            styleContainerNode.adoptedStyleSheets = [...styleContainerNode.adoptedStyleSheets, style];
          }
        }
        return scopeId2;
      };
      attachStyles = (hostRef) => {
        const cmpMeta = hostRef.$cmpMeta$;
        const elm = hostRef.$hostElement$;
        const flags = cmpMeta.$flags$;
        const endAttachStyles = createTime("attachStyles", cmpMeta.$tagName$);
        const scopeId2 = addStyle(
          elm.shadowRoot ? elm.shadowRoot : elm.getRootNode(),
          cmpMeta
        );
        if (flags & 10 && flags & 2) {
          elm["s-sc"] = scopeId2;
          elm.classList.add(scopeId2 + "-h");
        }
        endAttachStyles();
      };
      getScopeId = (cmp, mode) => "sc-" + cmp.$tagName$;
      setAccessor = (elm, memberName, oldValue, newValue, isSvg, flags) => {
        if (oldValue !== newValue) {
          let isProp = isMemberInElement(elm, memberName);
          memberName.toLowerCase();
          {
            const isComplex = isComplexType(newValue);
            if ((isProp || isComplex && newValue !== null) && !isSvg) {
              try {
                if (!elm.tagName.includes("-")) {
                  const n2 = newValue == null ? "" : newValue;
                  if (memberName === "list") {
                    isProp = false;
                  } else if (oldValue == null || elm[memberName] != n2) {
                    elm[memberName] = n2;
                  }
                } else {
                  elm[memberName] = newValue;
                }
              } catch (e2) {
              }
            }
            if (newValue == null || newValue === false) {
              if (newValue !== false || elm.getAttribute(memberName) === "") {
                {
                  elm.removeAttribute(memberName);
                }
              }
            } else if ((!isProp || flags & 4 || isSvg) && !isComplex) {
              newValue = newValue === true ? "" : newValue;
              {
                elm.setAttribute(memberName, newValue);
              }
            }
          }
        }
      };
      updateElement = (oldVnode, newVnode, isSvgMode2) => {
        const elm = newVnode.$elm$.nodeType === 11 && newVnode.$elm$.host ? newVnode.$elm$.host : newVnode.$elm$;
        const oldVnodeAttrs = oldVnode && oldVnode.$attrs$ || EMPTY_OBJ;
        const newVnodeAttrs = newVnode.$attrs$ || EMPTY_OBJ;
        {
          for (const memberName of sortedAttrNames(Object.keys(oldVnodeAttrs))) {
            if (!(memberName in newVnodeAttrs)) {
              setAccessor(elm, memberName, oldVnodeAttrs[memberName], void 0, isSvgMode2, newVnode.$flags$);
            }
          }
        }
        for (const memberName of sortedAttrNames(Object.keys(newVnodeAttrs))) {
          setAccessor(elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode2, newVnode.$flags$);
        }
      };
      useNativeShadowDom = false;
      isSvgMode = false;
      createElm = (oldParentVNode, newParentVNode, childIndex, parentElm) => {
        const newVNode2 = newParentVNode.$children$[childIndex];
        let i2 = 0;
        let elm;
        let childNode;
        {
          elm = newVNode2.$elm$ = doc.createElement(
            !useNativeShadowDom && BUILD.slotRelocation && newVNode2.$flags$ & 2 ? "slot-fb" : newVNode2.$tag$
          );
          {
            updateElement(null, newVNode2, isSvgMode);
          }
          const rootNode = elm.getRootNode();
          const isElementWithinShadowRoot = !rootNode.querySelector("body");
          if (!isElementWithinShadowRoot && BUILD.scoped && isDef(scopeId) && elm["s-si"] !== scopeId) {
            elm.classList.add(elm["s-si"] = scopeId);
          }
          if (newVNode2.$children$) {
            for (i2 = 0; i2 < newVNode2.$children$.length; ++i2) {
              childNode = createElm(oldParentVNode, newVNode2, i2);
              if (childNode) {
                elm.appendChild(childNode);
              }
            }
          }
        }
        elm["s-hn"] = hostTagName;
        return elm;
      };
      addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx) => {
        let containerElm = parentElm;
        let childNode;
        if (containerElm.shadowRoot && containerElm.tagName === hostTagName) {
          containerElm = containerElm.shadowRoot;
        }
        for (; startIdx <= endIdx; ++startIdx) {
          if (vnodes[startIdx]) {
            childNode = createElm(null, parentVNode, startIdx);
            if (childNode) {
              vnodes[startIdx].$elm$ = childNode;
              insertBefore(containerElm, childNode, before);
            }
          }
        }
      };
      removeVnodes = (vnodes, startIdx, endIdx) => {
        for (let index = startIdx; index <= endIdx; ++index) {
          const vnode = vnodes[index];
          if (vnode) {
            const elm = vnode.$elm$;
            if (elm) {
              elm.remove();
            }
          }
        }
      };
      updateChildren = (parentElm, oldCh, newVNode2, newCh, isInitialRender = false) => {
        let oldStartIdx = 0;
        let newStartIdx = 0;
        let oldEndIdx = oldCh.length - 1;
        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];
        let newEndIdx = newCh.length - 1;
        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];
        let node;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
          if (oldStartVnode == null) {
            oldStartVnode = oldCh[++oldStartIdx];
          } else if (oldEndVnode == null) {
            oldEndVnode = oldCh[--oldEndIdx];
          } else if (newStartVnode == null) {
            newStartVnode = newCh[++newStartIdx];
          } else if (newEndVnode == null) {
            newEndVnode = newCh[--newEndIdx];
          } else if (isSameVnode(oldStartVnode, newStartVnode, isInitialRender)) {
            patch(oldStartVnode, newStartVnode, isInitialRender);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
          } else if (isSameVnode(oldEndVnode, newEndVnode, isInitialRender)) {
            patch(oldEndVnode, newEndVnode, isInitialRender);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (isSameVnode(oldStartVnode, newEndVnode, isInitialRender)) {
            patch(oldStartVnode, newEndVnode, isInitialRender);
            insertBefore(parentElm, oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (isSameVnode(oldEndVnode, newStartVnode, isInitialRender)) {
            patch(oldEndVnode, newStartVnode, isInitialRender);
            insertBefore(parentElm, oldEndVnode.$elm$, oldStartVnode.$elm$);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
          } else {
            {
              node = createElm(oldCh && oldCh[newStartIdx], newVNode2, newStartIdx);
              newStartVnode = newCh[++newStartIdx];
            }
            if (node) {
              {
                insertBefore(oldStartVnode.$elm$.parentNode, node, oldStartVnode.$elm$);
              }
            }
          }
        }
        if (oldStartIdx > oldEndIdx) {
          addVnodes(
            parentElm,
            newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$,
            newVNode2,
            newCh,
            newStartIdx,
            newEndIdx
          );
        } else if (newStartIdx > newEndIdx) {
          removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
      };
      isSameVnode = (leftVNode, rightVNode, isInitialRender = false) => {
        if (leftVNode.$tag$ === rightVNode.$tag$) {
          return true;
        }
        return false;
      };
      patch = (oldVNode, newVNode2, isInitialRender = false) => {
        const elm = newVNode2.$elm$ = oldVNode.$elm$;
        const oldChildren = oldVNode.$children$;
        const newChildren = newVNode2.$children$;
        {
          {
            {
              updateElement(oldVNode, newVNode2, isSvgMode);
            }
          }
          if (oldChildren !== null && newChildren !== null) {
            updateChildren(elm, oldChildren, newVNode2, newChildren, isInitialRender);
          } else if (newChildren !== null) {
            addVnodes(elm, null, newVNode2, newChildren, 0, newChildren.length - 1);
          } else if (
            // don't do this on initial render as it can cause non-hydrated content to be removed
            !isInitialRender && BUILD.updatable && oldChildren !== null
          ) {
            removeVnodes(oldChildren, 0, oldChildren.length - 1);
          }
        }
      };
      insertBefore = (parent, newNode, reference) => {
        const inserted = parent == null ? void 0 : parent.insertBefore(newNode, reference);
        return inserted;
      };
      renderVdom = (hostRef, renderFnResults, isInitialLoad = false) => {
        const hostElm = hostRef.$hostElement$;
        const cmpMeta = hostRef.$cmpMeta$;
        const oldVNode = hostRef.$vnode$ || newVNode(null, null);
        const rootVnode = isHost(renderFnResults) ? renderFnResults : h2(null, null, renderFnResults);
        hostTagName = hostElm.tagName;
        if (cmpMeta.$attrsToReflect$) {
          rootVnode.$attrs$ = rootVnode.$attrs$ || {};
          cmpMeta.$attrsToReflect$.map(
            ([propName, attribute]) => rootVnode.$attrs$[attribute] = hostElm[propName]
          );
        }
        if (isInitialLoad && rootVnode.$attrs$) {
          for (const key of Object.keys(rootVnode.$attrs$)) {
            if (hostElm.hasAttribute(key) && !["key", "ref", "style", "class"].includes(key)) {
              rootVnode.$attrs$[key] = hostElm[key];
            }
          }
        }
        rootVnode.$tag$ = null;
        rootVnode.$flags$ |= 4;
        hostRef.$vnode$ = rootVnode;
        rootVnode.$elm$ = oldVNode.$elm$ = hostElm.shadowRoot || hostElm;
        {
          scopeId = hostElm["s-sc"];
        }
        useNativeShadowDom = (cmpMeta.$flags$ & 1) !== 0;
        patch(oldVNode, rootVnode, isInitialLoad);
      };
      attachToAncestor = (hostRef, ancestorComponent) => {
        if (ancestorComponent && !hostRef.$onRenderResolve$ && ancestorComponent["s-p"]) {
          ancestorComponent["s-p"].push(new Promise((r) => hostRef.$onRenderResolve$ = r));
        }
      };
      scheduleUpdate = (hostRef, isInitialLoad) => {
        {
          hostRef.$flags$ |= 16;
        }
        if (hostRef.$flags$ & 4) {
          hostRef.$flags$ |= 512;
          return;
        }
        attachToAncestor(hostRef, hostRef.$ancestorComponent$);
        const dispatch = () => dispatchHooks(hostRef, isInitialLoad);
        return writeTask(dispatch);
      };
      dispatchHooks = (hostRef, isInitialLoad) => {
        const elm = hostRef.$hostElement$;
        const endSchedule = createTime("scheduleUpdate", hostRef.$cmpMeta$.$tagName$);
        const instance = hostRef.$lazyInstance$;
        if (!instance) {
          throw new Error(
            `Can't render component <${elm.tagName.toLowerCase()} /> with invalid Stencil runtime! Make sure this imported component is compiled with a \`externalRuntime: true\` flag. For more information, please refer to https://stenciljs.com/docs/custom-elements#externalruntime`
          );
        }
        let maybePromise;
        if (isInitialLoad) {
          {
            maybePromise = safeCall(instance, "componentWillLoad");
          }
        }
        endSchedule();
        return enqueue(maybePromise, () => updateComponent(hostRef, instance, isInitialLoad));
      };
      enqueue = (maybePromise, fn) => isPromisey(maybePromise) ? maybePromise.then(fn).catch((err2) => {
        console.error(err2);
        fn();
      }) : fn();
      isPromisey = (maybePromise) => maybePromise instanceof Promise || maybePromise && maybePromise.then && typeof maybePromise.then === "function";
      updateComponent = async (hostRef, instance, isInitialLoad) => {
        var _a;
        const elm = hostRef.$hostElement$;
        const endUpdate = createTime("update", hostRef.$cmpMeta$.$tagName$);
        const rc = elm["s-rc"];
        if (isInitialLoad) {
          attachStyles(hostRef);
        }
        const endRender = createTime("render", hostRef.$cmpMeta$.$tagName$);
        {
          callRender(hostRef, instance, elm, isInitialLoad);
        }
        if (rc) {
          rc.map((cb) => cb());
          elm["s-rc"] = void 0;
        }
        endRender();
        endUpdate();
        {
          const childrenPromises = (_a = elm["s-p"]) != null ? _a : [];
          const postUpdate = () => postUpdateComponent(hostRef);
          if (childrenPromises.length === 0) {
            postUpdate();
          } else {
            Promise.all(childrenPromises).then(postUpdate);
            hostRef.$flags$ |= 4;
            childrenPromises.length = 0;
          }
        }
      };
      callRender = (hostRef, instance, elm, isInitialLoad) => {
        try {
          instance = instance.render();
          {
            hostRef.$flags$ &= ~16;
          }
          {
            hostRef.$flags$ |= 2;
          }
          {
            {
              {
                renderVdom(hostRef, instance, isInitialLoad);
              }
            }
          }
        } catch (e2) {
          consoleError(e2, hostRef.$hostElement$);
        }
        return null;
      };
      postUpdateComponent = (hostRef) => {
        const tagName = hostRef.$cmpMeta$.$tagName$;
        const elm = hostRef.$hostElement$;
        const endPostUpdate = createTime("postUpdate", tagName);
        const instance = hostRef.$lazyInstance$;
        const ancestorComponent = hostRef.$ancestorComponent$;
        if (!(hostRef.$flags$ & 64)) {
          hostRef.$flags$ |= 64;
          {
            addHydratedFlag(elm);
          }
          {
            safeCall(instance, "componentDidLoad");
          }
          endPostUpdate();
          {
            hostRef.$onReadyResolve$(elm);
            if (!ancestorComponent) {
              appDidLoad();
            }
          }
        } else {
          endPostUpdate();
        }
        {
          hostRef.$onInstanceResolve$(elm);
        }
        {
          if (hostRef.$onRenderResolve$) {
            hostRef.$onRenderResolve$();
            hostRef.$onRenderResolve$ = void 0;
          }
          if (hostRef.$flags$ & 512) {
            nextTick2(() => scheduleUpdate(hostRef, false));
          }
          hostRef.$flags$ &= ~(4 | 512);
        }
      };
      appDidLoad = (who) => {
        {
          addHydratedFlag(doc.documentElement);
        }
        nextTick2(() => emitEvent(win, "appload", { detail: { namespace: NAMESPACE } }));
      };
      safeCall = (instance, method, arg) => {
        if (instance && instance[method]) {
          try {
            return instance[method](arg);
          } catch (e2) {
            consoleError(e2);
          }
        }
        return void 0;
      };
      addHydratedFlag = (elm) => {
        var _a;
        return elm.classList.add((_a = BUILD.hydratedSelectorName) != null ? _a : "hydrated");
      };
      getValue = (ref, propName) => getHostRef(ref).$instanceValues$.get(propName);
      setValue = (ref, propName, newVal, cmpMeta) => {
        const hostRef = getHostRef(ref);
        if (!hostRef) {
          throw new Error(
            `Couldn't find host element for "${cmpMeta.$tagName$}" as it is unknown to this Stencil runtime. This usually happens when integrating a 3rd party Stencil component with another Stencil component or application. Please reach out to the maintainers of the 3rd party Stencil component or report this on the Stencil Discord server (https://chat.stenciljs.com) or comment on this similar [GitHub issue](https://github.com/ionic-team/stencil/issues/5457).`
          );
        }
        const elm = hostRef.$hostElement$;
        const oldVal = hostRef.$instanceValues$.get(propName);
        const flags = hostRef.$flags$;
        const instance = hostRef.$lazyInstance$;
        newVal = parsePropertyValue(newVal, cmpMeta.$members$[propName][0]);
        const areBothNaN = Number.isNaN(oldVal) && Number.isNaN(newVal);
        const didValueChange = newVal !== oldVal && !areBothNaN;
        if ((!(flags & 8) || oldVal === void 0) && didValueChange) {
          hostRef.$instanceValues$.set(propName, newVal);
          if (instance) {
            if (cmpMeta.$watchers$ && flags & 128) {
              const watchMethods = cmpMeta.$watchers$[propName];
              if (watchMethods) {
                watchMethods.map((watchMethodName) => {
                  try {
                    instance[watchMethodName](newVal, oldVal, propName);
                  } catch (e2) {
                    consoleError(e2, elm);
                  }
                });
              }
            }
            if ((flags & (2 | 16)) === 2) {
              scheduleUpdate(hostRef, false);
            }
          }
        }
      };
      proxyComponent = (Cstr, cmpMeta, flags) => {
        var _a, _b;
        const prototype = Cstr.prototype;
        if (cmpMeta.$members$ || (cmpMeta.$watchers$ || Cstr.watchers)) {
          if (Cstr.watchers && !cmpMeta.$watchers$) {
            cmpMeta.$watchers$ = Cstr.watchers;
          }
          const members = Object.entries((_a = cmpMeta.$members$) != null ? _a : {});
          members.map(([memberName, [memberFlags]]) => {
            if (memberFlags & 31 || flags & 2 && memberFlags & 32) {
              Object.defineProperty(prototype, memberName, {
                get() {
                  return getValue(this, memberName);
                },
                set(newValue) {
                  setValue(this, memberName, newValue, cmpMeta);
                },
                configurable: true,
                enumerable: true
              });
            } else if (flags & 1 && memberFlags & 64) {
              Object.defineProperty(prototype, memberName, {
                value(...args) {
                  var _a2;
                  const ref = getHostRef(this);
                  return (_a2 = ref == null ? void 0 : ref.$onInstancePromise$) == null ? void 0 : _a2.then(() => {
                    var _a3;
                    return (_a3 = ref.$lazyInstance$) == null ? void 0 : _a3[memberName](...args);
                  });
                }
              });
            }
          });
          if (flags & 1) {
            const attrNameToPropName = /* @__PURE__ */ new Map();
            prototype.attributeChangedCallback = function(attrName, oldValue, newValue) {
              plt.jmp(() => {
                var _a2;
                const propName = attrNameToPropName.get(attrName);
                if (this.hasOwnProperty(propName)) {
                  newValue = this[propName];
                  delete this[propName];
                } else if (prototype.hasOwnProperty(propName) && typeof this[propName] === "number" && // cast type to number to avoid TS compiler issues
                this[propName] == newValue) {
                  return;
                } else if (propName == null) {
                  const hostRef = getHostRef(this);
                  const flags2 = hostRef == null ? void 0 : hostRef.$flags$;
                  if (flags2 && !(flags2 & 8) && flags2 & 128 && newValue !== oldValue) {
                    const instance = hostRef.$lazyInstance$;
                    const entry = (_a2 = cmpMeta.$watchers$) == null ? void 0 : _a2[attrName];
                    entry == null ? void 0 : entry.forEach((callbackName) => {
                      if (instance[callbackName] != null) {
                        instance[callbackName].call(instance, newValue, oldValue, attrName);
                      }
                    });
                  }
                  return;
                }
                this[propName] = newValue === null && typeof this[propName] === "boolean" ? false : newValue;
              });
            };
            Cstr.observedAttributes = Array.from(
              /* @__PURE__ */ new Set([
                ...Object.keys((_b = cmpMeta.$watchers$) != null ? _b : {}),
                ...members.filter(
                  ([_, m2]) => m2[0] & 15
                  /* HasAttribute */
                ).map(([propName, m2]) => {
                  var _a2;
                  const attrName = m2[1] || propName;
                  attrNameToPropName.set(attrName, propName);
                  if (m2[0] & 512) {
                    (_a2 = cmpMeta.$attrsToReflect$) == null ? void 0 : _a2.push([propName, attrName]);
                  }
                  return attrName;
                })
              ])
            );
          }
        }
        return Cstr;
      };
      initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId) => {
        let Cstr;
        if ((hostRef.$flags$ & 32) === 0) {
          hostRef.$flags$ |= 32;
          const bundleId = cmpMeta.$lazyBundleId$;
          if (bundleId) {
            const CstrImport = loadModule(cmpMeta);
            if (CstrImport && "then" in CstrImport) {
              const endLoad = uniqueTime();
              Cstr = await CstrImport;
              endLoad();
            } else {
              Cstr = CstrImport;
            }
            if (!Cstr) {
              throw new Error(`Constructor for "${cmpMeta.$tagName$}#${hostRef.$modeName$}" was not found`);
            }
            if (!Cstr.isProxied) {
              {
                cmpMeta.$watchers$ = Cstr.watchers;
              }
              proxyComponent(
                Cstr,
                cmpMeta,
                2
                /* proxyState */
              );
              Cstr.isProxied = true;
            }
            const endNewInstance = createTime("createInstance", cmpMeta.$tagName$);
            {
              hostRef.$flags$ |= 8;
            }
            try {
              new Cstr(hostRef);
            } catch (e2) {
              consoleError(e2);
            }
            {
              hostRef.$flags$ &= ~8;
            }
            {
              hostRef.$flags$ |= 128;
            }
            endNewInstance();
            fireConnectedCallback(hostRef.$lazyInstance$);
          } else {
            Cstr = elm.constructor;
            const cmpTag = elm.localName;
            customElements.whenDefined(cmpTag).then(
              () => hostRef.$flags$ |= 128
              /* isWatchReady */
            );
          }
          if (Cstr && Cstr.style) {
            let style;
            if (typeof Cstr.style === "string") {
              style = Cstr.style;
            }
            const scopeId2 = getScopeId(cmpMeta);
            if (!styles.has(scopeId2)) {
              const endRegisterStyles = createTime("registerStyles", cmpMeta.$tagName$);
              registerStyle(scopeId2, style, !!(cmpMeta.$flags$ & 1));
              endRegisterStyles();
            }
          }
        }
        const ancestorComponent = hostRef.$ancestorComponent$;
        const schedule = () => scheduleUpdate(hostRef, true);
        if (ancestorComponent && ancestorComponent["s-rc"]) {
          ancestorComponent["s-rc"].push(schedule);
        } else {
          schedule();
        }
      };
      fireConnectedCallback = (instance) => {
        {
          safeCall(instance, "connectedCallback");
        }
      };
      connectedCallback = (elm) => {
        if ((plt.$flags$ & 1) === 0) {
          const hostRef = getHostRef(elm);
          const cmpMeta = hostRef.$cmpMeta$;
          const endConnected = createTime("connectedCallback", cmpMeta.$tagName$);
          if (!(hostRef.$flags$ & 1)) {
            hostRef.$flags$ |= 1;
            {
              let ancestorComponent = elm;
              while (ancestorComponent = ancestorComponent.parentNode || ancestorComponent.host) {
                if (ancestorComponent["s-p"]) {
                  attachToAncestor(hostRef, hostRef.$ancestorComponent$ = ancestorComponent);
                  break;
                }
              }
            }
            if (cmpMeta.$members$) {
              Object.entries(cmpMeta.$members$).map(([memberName, [memberFlags]]) => {
                if (memberFlags & 31 && elm.hasOwnProperty(memberName)) {
                  const value = elm[memberName];
                  delete elm[memberName];
                  elm[memberName] = value;
                }
              });
            }
            {
              initializeComponent(elm, hostRef, cmpMeta);
            }
          } else {
            if (hostRef == null ? void 0 : hostRef.$lazyInstance$) {
              fireConnectedCallback(hostRef.$lazyInstance$);
            } else if (hostRef == null ? void 0 : hostRef.$onReadyPromise$) {
              hostRef.$onReadyPromise$.then(() => fireConnectedCallback(hostRef.$lazyInstance$));
            }
          }
          endConnected();
        }
      };
      disconnectInstance = (instance) => {
      };
      disconnectedCallback = async (elm) => {
        if ((plt.$flags$ & 1) === 0) {
          const hostRef = getHostRef(elm);
          if (hostRef == null ? void 0 : hostRef.$lazyInstance$) ;
          else if (hostRef == null ? void 0 : hostRef.$onReadyPromise$) {
            hostRef.$onReadyPromise$.then(() => disconnectInstance());
          }
        }
      };
      bootstrapLazy = (lazyBundles, options = {}) => {
        var _a;
        const endBootstrap = createTime();
        const cmpTags = [];
        const exclude = options.exclude || [];
        const customElements2 = win.customElements;
        const head = doc.head;
        const metaCharset = /* @__PURE__ */ head.querySelector("meta[charset]");
        const dataStyles = /* @__PURE__ */ doc.createElement("style");
        const deferredConnectedCallbacks = [];
        let appLoadFallback;
        let isBootstrapping = true;
        Object.assign(plt, options);
        plt.$resourcesUrl$ = new URL(options.resourcesUrl || "./", doc.baseURI).href;
        let hasSlotRelocation = false;
        lazyBundles.map((lazyBundle) => {
          lazyBundle[1].map((compactMeta) => {
            var _a2;
            const cmpMeta = {
              $flags$: compactMeta[0],
              $tagName$: compactMeta[1],
              $members$: compactMeta[2],
              $listeners$: compactMeta[3]
            };
            if (cmpMeta.$flags$ & 4) {
              hasSlotRelocation = true;
            }
            {
              cmpMeta.$members$ = compactMeta[2];
            }
            {
              cmpMeta.$attrsToReflect$ = [];
            }
            {
              cmpMeta.$watchers$ = (_a2 = compactMeta[4]) != null ? _a2 : {};
            }
            const tagName = cmpMeta.$tagName$;
            const HostElement = class extends HTMLElement {
              // StencilLazyHost
              constructor(self2) {
                super(self2);
                this.hasRegisteredEventListeners = false;
                self2 = this;
                registerHost(self2, cmpMeta);
                if (cmpMeta.$flags$ & 1) {
                  {
                    if (!self2.shadowRoot) {
                      {
                        self2.attachShadow({ mode: "open" });
                      }
                    } else {
                      if (self2.shadowRoot.mode !== "open") {
                        throw new Error(
                          `Unable to re-use existing shadow root for ${cmpMeta.$tagName$}! Mode is set to ${self2.shadowRoot.mode} but Stencil only supports open shadow roots.`
                        );
                      }
                    }
                  }
                }
              }
              connectedCallback() {
                getHostRef(this);
                if (!this.hasRegisteredEventListeners) {
                  this.hasRegisteredEventListeners = true;
                }
                if (appLoadFallback) {
                  clearTimeout(appLoadFallback);
                  appLoadFallback = null;
                }
                if (isBootstrapping) {
                  deferredConnectedCallbacks.push(this);
                } else {
                  plt.jmp(() => connectedCallback(this));
                }
              }
              disconnectedCallback() {
                plt.jmp(() => disconnectedCallback(this));
              }
              componentOnReady() {
                return getHostRef(this).$onReadyPromise$;
              }
            };
            cmpMeta.$lazyBundleId$ = lazyBundle[0];
            if (!exclude.includes(tagName) && !customElements2.get(tagName)) {
              cmpTags.push(tagName);
              customElements2.define(
                tagName,
                proxyComponent(
                  HostElement,
                  cmpMeta,
                  1
                  /* isElementConstructor */
                )
              );
            }
          });
        });
        if (cmpTags.length > 0) {
          if (hasSlotRelocation) {
            dataStyles.textContent += SLOT_FB_CSS;
          }
          {
            dataStyles.textContent += cmpTags.sort() + HYDRATED_CSS;
          }
          if (dataStyles.innerHTML.length) {
            dataStyles.setAttribute("data-styles", "");
            const nonce = (_a = plt.$nonce$) != null ? _a : queryNonceMetaTagContent(doc);
            if (nonce != null) {
              dataStyles.setAttribute("nonce", nonce);
            }
            head.insertBefore(dataStyles, metaCharset ? metaCharset.nextSibling : head.firstChild);
          }
        }
        isBootstrapping = false;
        if (deferredConnectedCallbacks.length) {
          deferredConnectedCallbacks.map((host) => host.connectedCallback());
        } else {
          {
            plt.jmp(() => appLoadFallback = setTimeout(appDidLoad, 30));
          }
        }
        endBootstrap();
      };
    }
  });

  // node_modules/@capacitor-community/sqlite/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor-community/sqlite/dist/esm/definitions.js
  var SQLiteConnection = class {
    constructor(sqlite) {
      this.sqlite = sqlite;
      this._connectionDict = /* @__PURE__ */ new Map();
    }
    async initWebStore() {
      try {
        await this.sqlite.initWebStore();
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async saveToStore(database) {
      try {
        await this.sqlite.saveToStore({ database });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async saveToLocalDisk(database) {
      try {
        await this.sqlite.saveToLocalDisk({ database });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getFromLocalDiskToStore(overwrite) {
      const mOverwrite = overwrite != null ? overwrite : true;
      try {
        await this.sqlite.getFromLocalDiskToStore({ overwrite: mOverwrite });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async echo(value) {
      try {
        const res = await this.sqlite.echo({ value });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isSecretStored() {
      try {
        const res = await this.sqlite.isSecretStored();
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async setEncryptionSecret(passphrase) {
      try {
        await this.sqlite.setEncryptionSecret({ passphrase });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async changeEncryptionSecret(passphrase, oldpassphrase) {
      try {
        await this.sqlite.changeEncryptionSecret({
          passphrase,
          oldpassphrase
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async clearEncryptionSecret() {
      try {
        await this.sqlite.clearEncryptionSecret();
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async checkEncryptionSecret(passphrase) {
      try {
        const res = await this.sqlite.checkEncryptionSecret({
          passphrase
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async addUpgradeStatement(database, upgrade) {
      try {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        await this.sqlite.addUpgradeStatement({
          database,
          upgrade
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async createConnection(database, encrypted, mode, version2, readonly) {
      try {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        await this.sqlite.createConnection({
          database,
          encrypted,
          mode,
          version: version2,
          readonly
        });
        const conn = new SQLiteDBConnection(database, readonly, this.sqlite);
        const connName = readonly ? `RO_${database}` : `RW_${database}`;
        this._connectionDict.set(connName, conn);
        return Promise.resolve(conn);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async closeConnection(database, readonly) {
      try {
        if (database.endsWith(".db"))
          database = database.slice(0, -3);
        await this.sqlite.closeConnection({ database, readonly });
        const connName = readonly ? `RO_${database}` : `RW_${database}`;
        this._connectionDict.delete(connName);
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isConnection(database, readonly) {
      const res = {};
      if (database.endsWith(".db"))
        database = database.slice(0, -3);
      const connName = readonly ? `RO_${database}` : `RW_${database}`;
      res.result = this._connectionDict.has(connName);
      return Promise.resolve(res);
    }
    async retrieveConnection(database, readonly) {
      if (database.endsWith(".db"))
        database = database.slice(0, -3);
      const connName = readonly ? `RO_${database}` : `RW_${database}`;
      if (this._connectionDict.has(connName)) {
        const conn = this._connectionDict.get(connName);
        if (typeof conn != "undefined")
          return Promise.resolve(conn);
        else {
          return Promise.reject(`Connection ${database} is undefined`);
        }
      } else {
        return Promise.reject(`Connection ${database} does not exist`);
      }
    }
    async getNCDatabasePath(path2, database) {
      try {
        const databasePath = await this.sqlite.getNCDatabasePath({
          path: path2,
          database
        });
        return Promise.resolve(databasePath);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async createNCConnection(databasePath, version2) {
      try {
        await this.sqlite.createNCConnection({
          databasePath,
          version: version2
        });
        const conn = new SQLiteDBConnection(databasePath, true, this.sqlite);
        const connName = `RO_${databasePath})`;
        this._connectionDict.set(connName, conn);
        return Promise.resolve(conn);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async closeNCConnection(databasePath) {
      try {
        await this.sqlite.closeNCConnection({ databasePath });
        const connName = `RO_${databasePath})`;
        this._connectionDict.delete(connName);
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isNCConnection(databasePath) {
      const res = {};
      const connName = `RO_${databasePath})`;
      res.result = this._connectionDict.has(connName);
      return Promise.resolve(res);
    }
    async retrieveNCConnection(databasePath) {
      if (this._connectionDict.has(databasePath)) {
        const connName = `RO_${databasePath})`;
        const conn = this._connectionDict.get(connName);
        if (typeof conn != "undefined")
          return Promise.resolve(conn);
        else {
          return Promise.reject(`Connection ${databasePath} is undefined`);
        }
      } else {
        return Promise.reject(`Connection ${databasePath} does not exist`);
      }
    }
    async isNCDatabase(databasePath) {
      try {
        const res = await this.sqlite.isNCDatabase({ databasePath });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async retrieveAllConnections() {
      return this._connectionDict;
    }
    async closeAllConnections() {
      const delDict = /* @__PURE__ */ new Map();
      try {
        for (const key of this._connectionDict.keys()) {
          const database = key.substring(3);
          const readonly = key.substring(0, 3) === "RO_" ? true : false;
          await this.sqlite.closeConnection({ database, readonly });
          delDict.set(key, null);
        }
        for (const key of delDict.keys()) {
          this._connectionDict.delete(key);
        }
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async checkConnectionsConsistency() {
      try {
        const keys = [...this._connectionDict.keys()];
        const openModes = [];
        const dbNames = [];
        for (const key of keys) {
          openModes.push(key.substring(0, 2));
          dbNames.push(key.substring(3));
        }
        const res = await this.sqlite.checkConnectionsConsistency({
          dbNames,
          openModes
        });
        if (!res.result)
          this._connectionDict = /* @__PURE__ */ new Map();
        return Promise.resolve(res);
      } catch (err2) {
        this._connectionDict = /* @__PURE__ */ new Map();
        return Promise.reject(err2);
      }
    }
    async importFromJson(jsonstring) {
      try {
        const ret = await this.sqlite.importFromJson({ jsonstring });
        return Promise.resolve(ret);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isJsonValid(jsonstring) {
      try {
        const ret = await this.sqlite.isJsonValid({ jsonstring });
        return Promise.resolve(ret);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async copyFromAssets(overwrite) {
      const mOverwrite = overwrite != null ? overwrite : true;
      try {
        await this.sqlite.copyFromAssets({ overwrite: mOverwrite });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getFromHTTPRequest(url, overwrite) {
      const mOverwrite = overwrite != null ? overwrite : true;
      try {
        await this.sqlite.getFromHTTPRequest({ url, overwrite: mOverwrite });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isDatabaseEncrypted(database) {
      if (database.endsWith(".db"))
        database = database.slice(0, -3);
      try {
        const res = await this.sqlite.isDatabaseEncrypted({ database });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isInConfigEncryption() {
      try {
        const res = await this.sqlite.isInConfigEncryption();
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isInConfigBiometricAuth() {
      try {
        const res = await this.sqlite.isInConfigBiometricAuth();
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isDatabase(database) {
      if (database.endsWith(".db"))
        database = database.slice(0, -3);
      try {
        const res = await this.sqlite.isDatabase({ database });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getDatabaseList() {
      try {
        const res = await this.sqlite.getDatabaseList();
        const values = res.values;
        values.sort();
        const ret = { values };
        return Promise.resolve(ret);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getMigratableDbList(folderPath) {
      const path2 = folderPath ? folderPath : "default";
      try {
        const res = await this.sqlite.getMigratableDbList({
          folderPath: path2
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async addSQLiteSuffix(folderPath, dbNameList) {
      const path2 = folderPath ? folderPath : "default";
      const dbList = dbNameList ? dbNameList : [];
      try {
        const res = await this.sqlite.addSQLiteSuffix({
          folderPath: path2,
          dbNameList: dbList
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async deleteOldDatabases(folderPath, dbNameList) {
      const path2 = folderPath ? folderPath : "default";
      const dbList = dbNameList ? dbNameList : [];
      try {
        const res = await this.sqlite.deleteOldDatabases({
          folderPath: path2,
          dbNameList: dbList
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async moveDatabasesAndAddSuffix(folderPath, dbNameList) {
      const path2 = folderPath ? folderPath : "default";
      const dbList = dbNameList ? dbNameList : [];
      return this.sqlite.moveDatabasesAndAddSuffix({
        folderPath: path2,
        dbNameList: dbList
      });
    }
  };
  var SQLiteDBConnection = class {
    constructor(dbName, readonly, sqlite) {
      this.dbName = dbName;
      this.readonly = readonly;
      this.sqlite = sqlite;
    }
    getConnectionDBName() {
      return this.dbName;
    }
    getConnectionReadOnly() {
      return this.readonly;
    }
    async open() {
      try {
        await this.sqlite.open({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async close() {
      try {
        await this.sqlite.close({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async beginTransaction() {
      try {
        const changes = await this.sqlite.beginTransaction({
          database: this.dbName
        });
        return Promise.resolve(changes);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async commitTransaction() {
      try {
        const changes = await this.sqlite.commitTransaction({
          database: this.dbName
        });
        return Promise.resolve(changes);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async rollbackTransaction() {
      try {
        const changes = await this.sqlite.rollbackTransaction({
          database: this.dbName
        });
        return Promise.resolve(changes);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isTransactionActive() {
      try {
        const result = await this.sqlite.isTransactionActive({
          database: this.dbName
        });
        return Promise.resolve(result);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async loadExtension(path2) {
      try {
        await this.sqlite.loadExtension({
          database: this.dbName,
          path: path2,
          readonly: this.readonly
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async enableLoadExtension(toggle) {
      try {
        await this.sqlite.enableLoadExtension({
          database: this.dbName,
          toggle,
          readonly: this.readonly
        });
        return Promise.resolve();
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getUrl() {
      try {
        const res = await this.sqlite.getUrl({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getVersion() {
      try {
        const version2 = await this.sqlite.getVersion({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve(version2);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getTableList() {
      try {
        const res = await this.sqlite.getTableList({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async execute(statements, transaction = true, isSQL92 = true) {
      try {
        if (!this.readonly) {
          const res = await this.sqlite.execute({
            database: this.dbName,
            statements,
            transaction,
            readonly: false,
            isSQL92
          });
          return Promise.resolve(res);
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async query(statement, values, isSQL92 = true) {
      let res;
      try {
        if (values && values.length > 0) {
          res = await this.sqlite.query({
            database: this.dbName,
            statement,
            values,
            readonly: this.readonly,
            isSQL92: true
          });
        } else {
          res = await this.sqlite.query({
            database: this.dbName,
            statement,
            values: [],
            readonly: this.readonly,
            isSQL92
          });
        }
        res = await this.reorderRows(res);
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async run(statement, values, transaction = true, returnMode = "no", isSQL92 = true) {
      let res;
      try {
        if (!this.readonly) {
          if (values && values.length > 0) {
            res = await this.sqlite.run({
              database: this.dbName,
              statement,
              values,
              transaction,
              readonly: false,
              returnMode,
              isSQL92: true
            });
          } else {
            res = await this.sqlite.run({
              database: this.dbName,
              statement,
              values: [],
              transaction,
              readonly: false,
              returnMode,
              isSQL92
            });
          }
          res.changes = await this.reorderRows(res.changes);
          return Promise.resolve(res);
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async executeSet(set, transaction = true, returnMode = "no", isSQL92 = true) {
      let res;
      try {
        if (!this.readonly) {
          res = await this.sqlite.executeSet({
            database: this.dbName,
            set,
            transaction,
            readonly: false,
            returnMode,
            isSQL92
          });
          res.changes = await this.reorderRows(res.changes);
          return Promise.resolve(res);
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isExists() {
      try {
        const res = await this.sqlite.isDBExists({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isTable(table) {
      try {
        const res = await this.sqlite.isTableExists({
          database: this.dbName,
          table,
          readonly: this.readonly
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async isDBOpen() {
      try {
        const res = await this.sqlite.isDBOpen({
          database: this.dbName,
          readonly: this.readonly
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async delete() {
      try {
        if (!this.readonly) {
          await this.sqlite.deleteDatabase({
            database: this.dbName,
            readonly: false
          });
          return Promise.resolve();
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async createSyncTable() {
      try {
        if (!this.readonly) {
          const res = await this.sqlite.createSyncTable({
            database: this.dbName,
            readonly: false
          });
          return Promise.resolve(res);
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async setSyncDate(syncdate) {
      try {
        if (!this.readonly) {
          await this.sqlite.setSyncDate({
            database: this.dbName,
            syncdate,
            readonly: false
          });
          return Promise.resolve();
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async getSyncDate() {
      try {
        const res = await this.sqlite.getSyncDate({
          database: this.dbName,
          readonly: this.readonly
        });
        let retDate = "";
        if (res.syncDate > 0)
          retDate = new Date(res.syncDate * 1e3).toISOString();
        return Promise.resolve(retDate);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async exportToJson(mode, encrypted = false) {
      try {
        const res = await this.sqlite.exportToJson({
          database: this.dbName,
          jsonexportmode: mode,
          readonly: this.readonly,
          encrypted
        });
        return Promise.resolve(res);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async deleteExportedRows() {
      try {
        if (!this.readonly) {
          await this.sqlite.deleteExportedRows({
            database: this.dbName,
            readonly: false
          });
          return Promise.resolve();
        } else {
          return Promise.reject("not allowed in read-only mode");
        }
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
    async executeTransaction(txn, isSQL92 = true) {
      let changes = 0;
      let isActive = false;
      if (!this.readonly) {
        await this.sqlite.beginTransaction({
          database: this.dbName
        });
        isActive = await this.sqlite.isTransactionActive({
          database: this.dbName
        });
        if (!isActive) {
          return Promise.reject("After Begin Transaction, no transaction active");
        }
        try {
          for (const task of txn) {
            if (typeof task !== "object" || !("statement" in task)) {
              throw new Error("Error a task.statement must be provided");
            }
            if ("values" in task && task.values && task.values.length > 0) {
              const retMode = task.statement.toUpperCase().includes("RETURNING") ? "all" : "no";
              const ret = await this.sqlite.run({
                database: this.dbName,
                statement: task.statement,
                values: task.values,
                transaction: false,
                readonly: false,
                returnMode: retMode,
                isSQL92
              });
              if (ret.changes.changes < 0) {
                throw new Error("Error in transaction method run ");
              }
              changes += ret.changes.changes;
            } else {
              const ret = await this.sqlite.execute({
                database: this.dbName,
                statements: task.statement,
                transaction: false,
                readonly: false
              });
              if (ret.changes.changes < 0) {
                throw new Error("Error in transaction method execute ");
              }
              changes += ret.changes.changes;
            }
          }
          const retC = await this.sqlite.commitTransaction({
            database: this.dbName
          });
          changes += retC.changes.changes;
          const retChanges = { changes: { changes } };
          return Promise.resolve(retChanges);
        } catch (err2) {
          const msg = err2.message ? err2.message : err2;
          await this.sqlite.rollbackTransaction({
            database: this.dbName
          });
          return Promise.reject(msg);
        }
      } else {
        return Promise.reject("not allowed in read-only mode");
      }
    }
    async reorderRows(res) {
      const retRes = res;
      if (res?.values && typeof res.values[0] === "object") {
        if (Object.keys(res.values[0]).includes("ios_columns")) {
          const columnList = res.values[0]["ios_columns"];
          const iosRes = [];
          for (let i = 1; i < res.values.length; i++) {
            const rowJson = res.values[i];
            const resRowJson = {};
            for (const item of columnList) {
              resRowJson[item] = rowJson[item];
            }
            iosRes.push(resRowJson);
          }
          retRes["values"] = iosRes;
        }
      }
      return Promise.resolve(retRes);
    }
  };

  // node_modules/@capacitor-community/sqlite/dist/esm/index.js
  var CapacitorSQLite = registerPlugin("CapacitorSQLite", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m2) => new m2.CapacitorSQLiteWeb()),
    electron: () => window.CapacitorCustomPlatform.plugins.CapacitorSQLite
  });

  // src/lib/database.js
  init_dist();

  // node_modules/jeep-sqlite/dist/esm/loader.js
  init_index_68ac790b();
  init_index_68ac790b();

  // node_modules/jeep-sqlite/dist/esm/app-globals-0f993ce5.js
  var globalScripts = () => {
  };

  // node_modules/jeep-sqlite/dist/esm/loader.js
  var defineCustomElements = async (win2, options) => {
    if (typeof window === "undefined") return void 0;
    await globalScripts();
    return bootstrapLazy([["jeep-sqlite", [[1, "jeep-sqlite", { "autoSave": [516, "autosave"], "typeOrm": [516, "typeorm"], "wasmPath": [513, "wasmpath"], "pickText": [513, "picktext"], "saveText": [513, "savetext"], "buttonOptions": [513, "buttonoptions"], "innerAutoSave": [32], "innerTypeOrm": [32], "innerWasmPath": [32], "innerPickText": [32], "innerSaveText": [32], "innerButtonOptions": [32], "echo": [64], "createConnection": [64], "isConnection": [64], "closeConnection": [64], "open": [64], "close": [64], "getVersion": [64], "beginTransaction": [64], "commitTransaction": [64], "rollbackTransaction": [64], "isTransactionActive": [64], "execute": [64], "executeSet": [64], "run": [64], "query": [64], "getTableList": [64], "isDBExists": [64], "isDBOpen": [64], "deleteDatabase": [64], "isStoreOpen": [64], "copyFromAssets": [64], "isTableExists": [64], "createSyncTable": [64], "getSyncDate": [64], "setSyncDate": [64], "isJsonValid": [64], "importFromJson": [64], "exportToJson": [64], "deleteExportedRows": [64], "addUpgradeStatement": [64], "isDatabase": [64], "getDatabaseList": [64], "checkConnectionsConsistency": [64], "saveToStore": [64], "saveToLocalDisk": [64], "getFromLocalDiskToStore": [64], "getFromHTTPRequest": [64] }, null, { "autoSave": ["parseAutoSave"], "typeOrm": ["parseTypeOrm"], "wasmPath": ["parseWasmPath"], "pickText": ["parsePickText"], "saveText": ["parseSaveText"], "buttonOptions": ["parseButtonOptions"] }]]]], options);
  };

  // node_modules/jeep-sqlite/loader/index.js
  (function() {
    if ("undefined" !== typeof window && void 0 !== window.Reflect && void 0 !== window.customElements) {
      var a2 = HTMLElement;
      window.HTMLElement = function() {
        return Reflect.construct(a2, [], this.constructor);
      };
      HTMLElement.prototype = a2.prototype;
      HTMLElement.prototype.constructor = HTMLElement;
      Object.setPrototypeOf(HTMLElement, a2);
    }
  })();

  // src/lib/database.js
  var db = null;
  var sqliteConn = null;
  async function initDatabase() {
    await initWebSQLite();
    sqliteConn = new SQLiteConnection(CapacitorSQLite);
    if (Capacitor.getPlatform() === "web") {
      await sqliteConn.initWebStore();
    }
    const ret = await sqliteConn.createConnection("bimbar", true, "AES-256", 1, false);
    await ret.open();
    db = ret;
    await createSchema();
    await ensureDeviceUuid();
    return db;
  }
  async function initWebSQLite() {
    if (Capacitor.getPlatform() !== "web") return;
    defineCustomElements(window);
    if (!document.querySelector("jeep-sqlite")) {
      const jeepSqlite = document.createElement("jeep-sqlite");
      jeepSqlite.setAttribute("autoSave", "true");
      jeepSqlite.setAttribute("wasmPath", "./assets/wasm");
      document.body.appendChild(jeepSqlite);
    }
    await customElements.whenDefined("jeep-sqlite");
  }
  async function query(sql, values) {
    const res = await db.query(sql, values);
    return res.values || [];
  }
  async function run(sql, values) {
    const res = await db.run(sql, values);
    return res;
  }
  async function execute(sql) {
    return await db.execute(sql);
  }
  async function createSchema() {
    await execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'gerente' CHECK(role IN ('admin','gerente','caixa')),
      nome_completo TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      token_version INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS dancarinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      telefone TEXT,
      ativa INTEGER NOT NULL DEFAULT 1,
      comissao REAL NOT NULL DEFAULT 0,
      comissao_percentual REAL NOT NULL DEFAULT 30,
      comissao_danca_percentual REAL NOT NULL DEFAULT 62.50,
      danca_30_nome TEXT DEFAULT '',
      danca_30_qty INTEGER DEFAULT 0,
      danca_30_valor REAL DEFAULT 160,
      danca_60_nome TEXT DEFAULT '',
      danca_60_qty INTEGER DEFAULT 0,
      danca_60_valor REAL DEFAULT 320,
      danca_3_nome TEXT DEFAULT '',
      danca_3_qty INTEGER DEFAULT 0,
      danca_3_valor REAL DEFAULT 0,
      danca_4_nome TEXT DEFAULT '',
      danca_4_qty INTEGER DEFAULT 0,
      danca_4_valor REAL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT UNIQUE NOT NULL,
      cargo TEXT,
      telefone TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS caixa_diario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT UNIQUE NOT NULL,
      troco_inicial REAL NOT NULL DEFAULT 0,
      comanda_inicio INTEGER,
      comanda_fim INTEGER,
      total_comandas REAL NOT NULL DEFAULT 0,
      total_cartoes REAL NOT NULL DEFAULT 0,
      total_especies REAL NOT NULL DEFAULT 0,
      dinheiro_contado REAL,
      diferenca_caixa REAL,
      responsavel_fechamento TEXT,
      fechado_em TEXT,
      observacao TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS caixa_saidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_diario_id INTEGER NOT NULL REFERENCES caixa_diario(id),
      categoria TEXT NOT NULL CHECK(categoria IN ('UBER','PAGODE','GELO','CIGARRO','MERCADO','PAGAMENTOS','VALES_ESPECIES','VALES_BAR','FIADO','LAVANDERIAS','SEGURANCA','SHOW','OUTROS')),
      valor REAL NOT NULL,
      descricao TEXT,
      cancelada INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelada_em TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS shows_controle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_diario_id INTEGER NOT NULL REFERENCES caixa_diario(id),
      dancarina_id INTEGER REFERENCES dancarinas(id),
      numero_linha INTEGER CHECK(numero_linha BETWEEN 1 AND 23),
      valor_show REAL,
      quartos INTEGER DEFAULT 1,
      tempo TEXT,
      hora_entrada TEXT,
      hora_saida TEXT,
      tipo TEXT CHECK(tipo IN ('FX','FL')),
      cancelado INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelado_em TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS show_dancas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_controle_id INTEGER NOT NULL REFERENCES shows_controle(id) ON DELETE CASCADE,
      dancarina_id INTEGER NOT NULL REFERENCES dancarinas(id) ON DELETE CASCADE,
      valor_danca REAL NOT NULL CHECK(valor_danca > 0),
      quartos INTEGER DEFAULT 1,
      hora_entrada TEXT,
      hora_saida TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS vales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_pessoa TEXT NOT NULL CHECK(tipo_pessoa IN ('dancarina','funcionario')),
      pessoa_id INTEGER NOT NULL,
      valor REAL NOT NULL CHECK(valor > 0),
      descricao TEXT,
      pago INTEGER NOT NULL DEFAULT 0,
      data_valor TEXT NOT NULL DEFAULT (date('now')),
      cancelado INTEGER NOT NULL DEFAULT 0,
      motivo_cancelamento TEXT,
      cancelado_em TEXT,
      caixa_saida_id INTEGER REFERENCES caixa_saidas(id) ON DELETE SET NULL,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      acao TEXT NOT NULL,
      tabela TEXT NOT NULL,
      registro_id INTEGER,
      dados_antigos TEXT,
      dados_novos TEXT,
      ip TEXT,
      user_agent TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    await execute(`
    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    )
  `);
  }
  async function ensureDeviceUuid() {
    const rows = await query("SELECT valor FROM config WHERE chave = 'device_uuid'");
    if (rows.length === 0) {
      const uuid = crypto.randomUUID();
      await run("INSERT INTO config (chave, valor) VALUES (?, ?)", ["device_uuid", uuid]);
    }
  }
  async function hashPassword(password) {
    const crypto2 = window.crypto;
    const salt = Array.from(crypto2.getRandomValues(new Uint8Array(16))).map((b2) => b2.toString(36).padStart(2, "0")).join("");
    const encoder = new TextEncoder();
    const keyMaterial = await crypto2.subtle.importKey("raw", encoder.encode(password + salt), "PBKDF2", false, ["deriveBits"]);
    const hashBuffer = await crypto2.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 1e5, hash: "SHA-256" }, keyMaterial, 256);
    const hash = Array.from(new Uint8Array(hashBuffer)).map((b2) => b2.toString(36).padStart(2, "0")).join("");
    return { salt, hash };
  }
  async function verifyPassword(password, salt, storedHash) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password + salt), "PBKDF2", false, ["deriveBits"]);
    const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 1e5, hash: "SHA-256" }, keyMaterial, 256);
    const hash = Array.from(new Uint8Array(hashBuffer)).map((b2) => b2.toString(36).padStart(2, "0")).join("");
    return hash === storedHash;
  }

  // src/services/dancarinaService.js
  function calcComissao(comissaoFixa, totalDancas, comissaoDancaPct) {
    if (comissaoFixa > 0) return comissaoFixa;
    return Math.round(totalDancas * comissaoDancaPct / 100 * 100) / 100;
  }
  async function listarDancarinas(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const rows = await query(
      "SELECT d.*, COALESCE(v.total_vales, 0) as total_vales, COALESCE(v.total_pendente, 0) as vales_pendentes FROM dancarinas d LEFT JOIN (SELECT pessoa_id, SUM(valor) as total_vales, SUM(CASE WHEN pago = 0 AND cancelado = 0 THEN valor ELSE 0 END) as total_pendente FROM vales WHERE tipo_pessoa = ? AND cancelado = 0 GROUP BY pessoa_id) v ON v.pessoa_id = d.id WHERE d.ativa = 1 ORDER BY d.nome LIMIT ? OFFSET ?",
      ["dancarina", limit, offset]
    );
    const [{ c: c2 }] = await query("SELECT COUNT(*) as c FROM dancarinas WHERE ativa = 1");
    return { data: rows, total: c2 };
  }
  async function getDancarina(id) {
    const rows = await query("SELECT * FROM dancarinas WHERE id = ? AND ativa = 1", [id]);
    if (rows.length === 0) return null;
    return rows[0];
  }
  async function criarDancarina(dados) {
    const r = await run(
      `INSERT INTO dancarinas (nome, telefone, comissao, comissao_percentual, comissao_danca_percentual,
      danca_30_nome, danca_30_qty, danca_30_valor, danca_60_nome, danca_60_qty, danca_60_valor,
      danca_3_nome, danca_3_qty, danca_3_valor, danca_4_nome, danca_4_qty, danca_4_valor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome,
        dados.telefone,
        dados.comissao || 0,
        dados.comissao_percentual || 30,
        dados.comissao_danca_percentual || 62.5,
        dados.danca_30_nome || "30 min",
        dados.danca_30_qty || 0,
        dados.danca_30_valor || 160,
        dados.danca_60_nome || "60 min",
        dados.danca_60_qty || 0,
        dados.danca_60_valor || 320,
        dados.danca_3_nome || "",
        dados.danca_3_qty || 0,
        dados.danca_3_valor || 0,
        dados.danca_4_nome || "",
        dados.danca_4_qty || 0,
        dados.danca_4_valor || 0
      ]
    );
    return { id: r.changes?.lastId || r.lastId };
  }
  async function atualizarDancarina(id, dados) {
    await run(
      `UPDATE dancarinas SET nome = ?, telefone = ?, comissao = ?, comissao_percentual = ?, comissao_danca_percentual = ?,
      danca_30_nome = ?, danca_30_qty = ?, danca_30_valor = ?, danca_60_nome = ?, danca_60_qty = ?, danca_60_valor = ?,
      danca_3_nome = ?, danca_3_qty = ?, danca_3_valor = ?, danca_4_nome = ?, danca_4_qty = ?, danca_4_valor = ?
    WHERE id = ? AND ativa = 1`,
      [
        dados.nome,
        dados.telefone,
        dados.comissao || 0,
        dados.comissao_percentual || 30,
        dados.comissao_danca_percentual || 62.5,
        dados.danca_30_nome || "30 min",
        dados.danca_30_qty || 0,
        dados.danca_30_valor || 160,
        dados.danca_60_nome || "60 min",
        dados.danca_60_qty || 0,
        dados.danca_60_valor || 320,
        dados.danca_3_nome || "",
        dados.danca_3_qty || 0,
        dados.danca_3_valor || 0,
        dados.danca_4_nome || "",
        dados.danca_4_qty || 0,
        dados.danca_4_valor || 0,
        id
      ]
    );
    return { id };
  }
  async function excluirDancarina(id) {
    await run("UPDATE dancarinas SET ativa = 0 WHERE id = ?", [id]);
  }
  async function listarDancarinasSelect() {
    return await query("SELECT id, nome FROM dancarinas WHERE ativa = 1 ORDER BY nome");
  }

  // src/services/caixaService.js
  async function listarCaixas(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const rows = await query(
      `SELECT cd.*, u.nome_completo as responsavel_nome,
      COALESCE(s.total_saidas, 0) as total_saidas, COALESCE(s.valor_saidas, 0) as valor_saidas
    FROM caixa_diario cd
    LEFT JOIN usuarios u ON u.id = cd.criado_por
    LEFT JOIN (SELECT caixa_diario_id, COUNT(*) as total_saidas, SUM(valor) as valor_saidas FROM caixa_saidas WHERE cancelada = 0 GROUP BY caixa_diario_id) s ON s.caixa_diario_id = cd.id
    ORDER BY cd.data DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [{ c: c2 }] = await query("SELECT COUNT(*) as c FROM caixa_diario");
    return { data: rows, total: c2 };
  }
  async function getCaixa(data) {
    const rows = await query("SELECT * FROM caixa_diario WHERE data = ?", [data]);
    return rows.length > 0 ? rows[0] : null;
  }
  async function abrirCaixa(dados) {
    await run(
      `INSERT INTO caixa_diario (data, troco_inicial, comanda_inicio, criado_por)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(data) DO UPDATE SET troco_inicial = excluded.troco_inicial, comanda_inicio = excluded.comanda_inicio`,
      [dados.data, dados.troco_inicial || 0, dados.comanda_inicio || null, dados.criado_por || null]
    );
    return { data: dados.data };
  }
  async function fecharCaixa(data, dados) {
    const caixa = await getCaixa(data);
    if (!caixa) throw new Error("Caixa n\xE3o encontrado para esta data");
    const entradas = (dados.total_comandas || 0) + (dados.total_cartoes || 0) + (dados.total_especies || 0);
    const saidas = caixa.valor_saidas || 0;
    const diferenca = dados.dinheiro_contado != null ? Math.round((dados.dinheiro_contado - (caixa.troco_inicial + entradas - saidas)) * 100) / 100 : null;
    await run(
      `UPDATE caixa_diario SET
      total_comandas = ?, total_cartoes = ?, total_especies = ?,
      comanda_fim = ?, dinheiro_contado = ?, diferenca_caixa = ?,
      responsavel_fechamento = ?, fechado_em = datetime('now'), observacao = ?
    WHERE data = ?`,
      [
        dados.total_comandas || 0,
        dados.total_cartoes || 0,
        dados.total_especies || 0,
        dados.comanda_fim || null,
        dados.dinheiro_contado || null,
        diferenca,
        dados.responsavel_fechamento || null,
        dados.observacao || "",
        data
      ]
    );
    return { data, diferenca };
  }
  async function excluirCaixa(id) {
    const rows = await query("SELECT * FROM caixa_diario WHERE id = ?", [id]);
    if (rows.length === 0) throw new Error("Caixa n\xE3o encontrado");
    await run("UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime('now') WHERE caixa_diario_id = ?", ["Caixa cancelado", id]);
    await run("UPDATE shows_controle SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime('now') WHERE caixa_diario_id = ?", ["Caixa cancelado", id]);
    await run("DELETE FROM caixa_diario WHERE id = ?", [id]);
  }

  // src/services/saidaService.js
  async function listarSaidas(data) {
    return await query(
      "SELECT s.*, u.nome_completo as criado_por_nome FROM caixa_saidas s LEFT JOIN usuarios u ON u.id = s.criado_por WHERE s.cancelada = 0 AND s.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?) ORDER BY s.criado_em DESC",
      [data]
    );
  }
  async function criarSaida(data, dados, criadoPor) {
    const caixas = await query("SELECT id FROM caixa_diario WHERE data = ?", [data]);
    let caixaId;
    if (caixas.length === 0) {
      const r2 = await run("INSERT INTO caixa_diario (data) VALUES (?)", [data]);
      caixaId = r2.changes?.lastId || r2.lastId;
    } else {
      caixaId = caixas[0].id;
    }
    const r = await run(
      "INSERT INTO caixa_saidas (caixa_diario_id, categoria, valor, descricao, criado_por) VALUES (?, ?, ?, ?, ?)",
      [caixaId, dados.categoria, dados.valor, dados.descricao || "", criadoPor || null]
    );
    return { id: r.changes?.lastId || r.lastId };
  }
  async function excluirSaida(id, motivo) {
    await run(
      "UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime('now') WHERE id = ?",
      [motivo || "Cancelado manualmente", id]
    );
  }

  // src/services/showService.js
  async function listarShows(data) {
    const rows = await query(
      `SELECT sc.*, d.nome as dancarina_nome FROM shows_controle sc
    LEFT JOIN dancarinas d ON d.id = sc.dancarina_id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY sc.numero_linha`,
      [data]
    );
    for (const show of rows) {
      const dancas = await query(
        `SELECT sd.*, d.nome as dancarina_nome FROM show_dancas sd
      JOIN dancarinas d ON d.id = sd.dancarina_id
      WHERE sd.show_controle_id = ?`,
        [show.id]
      );
      show.dancas = dancas;
      show.dancarina_ids = dancas.map((sd) => sd.dancarina_id);
      show.dancarina_nomes = dancas.map((sd) => sd.dancarina_nome).join(", ");
    }
    return rows;
  }
  async function criarShow(data, dados, criadoPor) {
    const caixas = await query("SELECT id FROM caixa_diario WHERE data = ?", [data]);
    let caixaId;
    if (caixas.length === 0) {
      const r2 = await run("INSERT INTO caixa_diario (data) VALUES (?)", [data]);
      caixaId = r2.changes?.lastId || r2.lastId;
    } else {
      caixaId = caixas[0].id;
    }
    const r = await run(
      `INSERT INTO shows_controle (caixa_diario_id, dancarina_id, numero_linha, valor_show, quartos, tempo, hora_entrada, hora_saida, tipo, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caixaId,
        null,
        dados.numero_linha,
        dados.valor_show,
        dados.quartos || 1,
        dados.tempo || "30 min",
        dados.hora_entrada || null,
        dados.hora_saida || null,
        dados.tipo || "FX",
        criadoPor || null
      ]
    );
    const showId = r.changes?.lastId || r.lastId;
    if (dados.dancarina_ids && dados.dancarina_ids.length > 0) {
      for (const did of dados.dancarina_ids) {
        await run(
          "INSERT INTO show_dancas (show_controle_id, dancarina_id, valor_danca, quartos, hora_entrada, hora_saida) VALUES (?, ?, ?, ?, ?, ?)",
          [showId, did, dados.valor_show, dados.quartos || 1, dados.hora_entrada || null, dados.hora_saida || null]
        );
      }
    } else if (dados.dancarina_id) {
      await run(
        "INSERT INTO show_dancas (show_controle_id, dancarina_id, valor_danca, quartos, hora_entrada, hora_saida) VALUES (?, ?, ?, ?, ?, ?)",
        [showId, dados.dancarina_id, dados.valor_show, dados.quartos || 1, dados.hora_entrada || null, dados.hora_saida || null]
      );
    }
    return { id: showId };
  }
  async function excluirShow(id, motivo) {
    await run(
      "UPDATE shows_controle SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime('now') WHERE id = ?",
      [motivo || "Cancelado manualmente", id]
    );
    await run("DELETE FROM show_dancas WHERE show_controle_id = ?", [id]);
  }

  // src/services/funcionarioService.js
  async function listarFuncionarios(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const rows = await query(
      `SELECT f.*, COALESCE(v.total_vales, 0) as total_vales, COALESCE(v.total_pendente, 0) as vales_pendentes
    FROM funcionarios f
    LEFT JOIN (SELECT pessoa_id, SUM(valor) as total_vales, SUM(CASE WHEN pago = 0 AND cancelado = 0 THEN valor ELSE 0 END) as total_pendente FROM vales WHERE tipo_pessoa = ? AND cancelado = 0 GROUP BY pessoa_id) v ON v.pessoa_id = f.id
    WHERE f.ativo = 1 ORDER BY f.nome LIMIT ? OFFSET ?`,
      ["funcionario", limit, offset]
    );
    const [{ c: c2 }] = await query("SELECT COUNT(*) as c FROM funcionarios WHERE ativo = 1");
    return { data: rows, total: c2 };
  }
  async function criarFuncionario(dados) {
    const r = await run(
      "INSERT INTO funcionarios (nome, cargo, telefone) VALUES (?, ?, ?)",
      [dados.nome, dados.cargo || "", dados.telefone || ""]
    );
    return { id: r.changes?.lastId || r.lastId };
  }
  async function excluirFuncionario(id) {
    await run("UPDATE funcionarios SET ativo = 0 WHERE id = ?", [id]);
  }

  // src/services/valeService.js
  async function listarVales(filtros = {}) {
    let sql = `SELECT v.*, CASE WHEN v.tipo_pessoa = 'dancarina' THEN d.nome WHEN v.tipo_pessoa = 'funcionario' THEN f.nome END as pessoa_nome
    FROM vales v
    LEFT JOIN dancarinas d ON d.id = v.pessoa_id AND v.tipo_pessoa = 'dancarina'
    LEFT JOIN funcionarios f ON f.id = v.pessoa_id AND v.tipo_pessoa = 'funcionario'
    WHERE v.cancelado = 0`;
    const params = [];
    if (filtros.tipo) {
      sql += " AND v.tipo_pessoa = ?";
      params.push(filtros.tipo);
    }
    if (filtros.pessoa_id) {
      sql += " AND v.pessoa_id = ?";
      params.push(filtros.pessoa_id);
    }
    if (filtros.data) {
      sql += " AND v.data_valor = ?";
      params.push(filtros.data);
    }
    sql += " ORDER BY v.criado_em DESC";
    return await query(sql, params);
  }
  async function criarVale(dados, criadoPor) {
    const rows = await query(
      `SELECT COALESCE(SUM(sd.valor_danca), 0) as total_shows FROM show_dancas sd
    JOIN shows_controle sc ON sc.id = sd.show_controle_id
    JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
    WHERE sd.dancarina_id = ? AND cd.data = ? AND sc.cancelado = 0`,
      [dados.pessoa_id, dados.data_valor]
    );
    const totalShows = rows[0]?.total_shows || 0;
    if (dados.valor > totalShows * 0.5) {
      throw new Error(`Valor do vale (R$ ${dados.valor}) excede 50% do total de shows (R$ ${totalShows})`);
    }
    let caixaSaidaId = null;
    if (dados.gerar_saida !== "nao") {
      const caixas = await query("SELECT id FROM caixa_diario WHERE data = ?", [dados.data_valor]);
      let caixaId;
      if (caixas.length === 0) {
        const r3 = await run("INSERT INTO caixa_diario (data) VALUES (?)", [dados.data_valor]);
        caixaId = r3.changes?.lastId || r3.lastId;
      } else {
        caixaId = caixas[0].id;
      }
      const r2 = await run(
        `INSERT INTO caixa_saidas (caixa_diario_id, categoria, valor, descricao, criado_por)
      VALUES (?, 'VALES_ESPECIES', ?, ?, ?)`,
        [caixaId, dados.valor, `Vale: ${dados.descricao || ""}`, criadoPor || null]
      );
      caixaSaidaId = r2.changes?.lastId || r2.lastId;
    }
    const tipoCat = dados.tipo_pessoa === "dancarina" ? "VALES_ESPECIES" : "VALES_BAR";
    const r = await run(
      "INSERT INTO vales (tipo_pessoa, pessoa_id, valor, descricao, data_valor, caixa_saida_id, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [dados.tipo_pessoa, dados.pessoa_id, dados.valor, dados.descricao || "", dados.data_valor, caixaSaidaId, criadoPor || null]
    );
    return { id: r.changes?.lastId || r.lastId };
  }
  async function pagarVale(id) {
    await run("UPDATE vales SET pago = 1 WHERE id = ? AND cancelado = 0", [id]);
  }
  async function excluirVale(id, motivo) {
    await run(
      "UPDATE vales SET cancelado = 1, motivo_cancelamento = ?, cancelado_em = datetime('now') WHERE id = ?",
      [motivo || "Cancelado manualmente", id]
    );
    const vales = await query("SELECT caixa_saida_id FROM vales WHERE id = ?", [id]);
    if (vales[0]?.caixa_saida_id) {
      await run(
        "UPDATE caixa_saidas SET cancelada = 1, motivo_cancelamento = ?, cancelada_em = datetime('now') WHERE id = ?",
        ["Vale cancelado", vales[0].caixa_saida_id]
      );
    }
  }

  // src/services/operacaoService.js
  async function getResumoOperacao(data) {
    const caixaRows = await query("SELECT * FROM caixa_diario WHERE data = ?", [data]);
    const caixa = caixaRows[0] || null;
    const saidas = await query(
      "SELECT COALESCE(SUM(valor), 0) as total FROM caixa_saidas WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
      [data]
    );
    const totalSaidas = saidas[0]?.total || 0;
    const shows = await query(
      "SELECT COUNT(*) as qtd, COALESCE(SUM(valor_show), 0) as total FROM shows_controle WHERE cancelado = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
      [data]
    );
    const totalShowsValor = shows[0]?.total || 0;
    const totalShowsQtd = shows[0]?.qtd || 0;
    const vales = await query(
      "SELECT COALESCE(SUM(valor), 0) as total FROM vales WHERE cancelado = 0 AND data_valor = ? AND pago = 0",
      [data]
    );
    const valesPendentes = vales[0]?.total || 0;
    const entradas = caixa ? Number(caixa.total_comandas) + Number(caixa.total_cartoes) + Number(caixa.total_especies) : 0;
    const saldoPrevisto = entradas - totalSaidas;
    const diferenca = caixa?.diferenca_caixa != null ? Number(caixa.diferenca_caixa) : null;
    const proxLinha = await getProximaLinhaNumero(data);
    const comissoesRows = await query(
      `SELECT d.id, d.nome, d.comissao, d.comissao_percentual, d.comissao_danca_percentual,
      COALESCE(s.total_dancas, 0) as total_dancas, COALESCE(s.valor_shows, 0) as valor_shows
    FROM dancarinas d
    LEFT JOIN (
      SELECT sd.dancarina_id, COUNT(*) as total_dancas, SUM(sd.valor_danca) as valor_shows
      FROM show_dancas sd
      JOIN shows_controle sc ON sc.id = sd.show_controle_id
      JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
      WHERE cd.data = ? AND sc.cancelado = 0
      GROUP BY sd.dancarina_id
    ) s ON s.dancarina_id = d.id
    WHERE d.ativa = 1
    ORDER BY d.nome`,
      [data]
    );
    const comissoes = comissoesRows.map((d2) => ({
      ...d2,
      comissao_calculada: calcComissao(Number(d2.comissao), Number(d2.valor_shows), Number(d2.comissao_danca_percentual))
    }));
    const totalComissao = comissoes.reduce((acc, c2) => acc + c2.comissao_calculada, 0);
    const ultimosRows = await query(
      `SELECT 'saida' as tipo, s.valor, s.descricao, s.categoria, s.criado_em FROM caixa_saidas s
    WHERE s.cancelada = 0 AND s.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    UNION ALL
    SELECT 'show' as tipo, sc.valor_show as valor, sd.dancarina_id || '' as descricao, sc.tipo as categoria, sc.criado_em FROM shows_controle sc
    LEFT JOIN show_dancas sd ON sd.show_controle_id = sc.id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY criado_em DESC LIMIT 20`,
      [data, data]
    );
    return {
      caixa,
      entradas,
      totalSaidas,
      saldoPrevisto,
      totalShows: totalShowsQtd,
      totalShowsValor,
      valesPendentes,
      totalComissao,
      diferenca,
      proximaLinha: proxLinha,
      comissoes,
      ultimos: ultimosRows
    };
  }
  async function getProximaLinhaNumero(data) {
    const linhas = await query(
      `SELECT numero_linha FROM shows_controle
    WHERE cancelado = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    ORDER BY numero_linha`,
      [data]
    );
    const usadas = new Set(linhas.map((r) => r.numero_linha));
    for (let i = 1; i <= 23; i++) if (!usadas.has(i)) return i;
    return 23;
  }

  // src/services/relatorioService.js
  async function saidasPorCategoria(data) {
    return await query(
      `SELECT categoria, COUNT(*) as quantidade, SUM(valor) as total
    FROM caixa_saidas
    WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)
    GROUP BY categoria ORDER BY total DESC`,
      [data]
    );
  }
  async function resumoCaixa(data) {
    const caixa = await query("SELECT * FROM caixa_diario WHERE data = ?", [data]);
    if (caixa.length === 0) return null;
    const saidas = await query(
      "SELECT COALESCE(SUM(valor), 0) as total FROM caixa_saidas WHERE cancelada = 0 AND caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)",
      [data]
    );
    const shows = await query(
      `SELECT COUNT(*) as total_shows, COALESCE(SUM(sc.valor_show), 0) as valor_shows,
      COUNT(DISTINCT sd.dancarina_id) as total_dancarinas
    FROM shows_controle sc
    LEFT JOIN show_dancas sd ON sd.show_controle_id = sc.id
    WHERE sc.cancelado = 0 AND sc.caixa_diario_id = (SELECT id FROM caixa_diario WHERE data = ?)`,
      [data]
    );
    const c2 = caixa[0];
    const entradas = Number(c2.total_comandas) + Number(c2.total_cartoes) + Number(c2.total_especies);
    const totalSaidas = saidas[0]?.total || 0;
    const saldo = entradas - totalSaidas + Number(c2.troco_inicial);
    return {
      data: c2.data,
      troco_inicial: c2.troco_inicial,
      comanda_inicio: c2.comanda_inicio,
      comanda_fim: c2.comanda_fim,
      total_comandas: c2.total_comandas,
      total_cartoes: c2.total_cartoes,
      total_especies: c2.total_especies,
      dinheiro_contado: c2.dinheiro_contado,
      diferenca_caixa: c2.diferenca_caixa,
      responsavel_fechamento: c2.responsavel_fechamento,
      observacao: c2.observacao,
      entradas,
      totalSaidas,
      saldo,
      fechado_em: c2.fechado_em,
      ...shows[0]
    };
  }
  async function totalDancarinas(data) {
    return await query(
      `SELECT d.id, d.nome, COUNT(sd.id) as total_dancas, COALESCE(SUM(sd.valor_danca), 0) as valor_total,
      COALESCE(SUM(sd.quartos), 0) as total_quartos,
      SUM(CASE WHEN sc.tipo = 'FX' THEN 1 ELSE 0 END) as fx_count,
      SUM(CASE WHEN sc.tipo = 'FL' THEN 1 ELSE 0 END) as fl_count
    FROM dancarinas d
    JOIN show_dancas sd ON sd.dancarina_id = d.id
    JOIN shows_controle sc ON sc.id = sd.show_controle_id
    JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id
    WHERE cd.data = ? AND sc.cancelado = 0 AND d.ativa = 1
    GROUP BY d.id, d.nome ORDER BY d.nome`,
      [data]
    );
  }
  async function financeiroDancarinas(data) {
    const rows = await query(
      `SELECT d.id, d.nome, d.comissao, d.comissao_percentual, d.comissao_danca_percentual,
      COUNT(sd.id) as total_dancas, COALESCE(SUM(sd.valor_danca), 0) as valor_shows,
      COALESCE(SUM(sd.quartos), 0) as total_quartos
    FROM dancarinas d
    LEFT JOIN show_dancas sd ON sd.dancarina_id = d.id
    LEFT JOIN shows_controle sc ON sc.id = sd.show_controle_id AND sc.cancelado = 0
    LEFT JOIN caixa_diario cd ON cd.id = sc.caixa_diario_id AND cd.data = ?
    WHERE d.ativa = 1
    GROUP BY d.id ORDER BY d.nome`,
      [data]
    );
    const vales = await query(
      "SELECT pessoa_id, SUM(valor) as total_vales FROM vales WHERE tipo_pessoa = 'dancarina' AND cancelado = 0 AND data_valor = ? GROUP BY pessoa_id",
      [data]
    );
    const valeMap = {};
    for (const v3 of vales) valeMap[v3.pessoa_id] = v3.total_vales;
    return rows.map((d2) => {
      const comissaoCalc = calcComissao(Number(d2.comissao), Number(d2.valor_shows), Number(d2.comissao_danca_percentual));
      const valesTotal = Number(valeMap[d2.id] || 0);
      return {
        ...d2,
        comissao_calculada: comissaoCalc,
        total_vales: valesTotal,
        valor_a_receber: Math.max(0, Number(d2.valor_shows) - comissaoCalc - valesTotal)
      };
    });
  }

  // src/lib/license.js
  var DEFAULT_SERVER_URL = "";
  async function getServerUrl() {
    const rows = await query("SELECT valor FROM config WHERE chave = 'server_url'");
    return rows.length > 0 ? rows[0].valor : DEFAULT_SERVER_URL;
  }
  async function setServerUrl(url) {
    const val = url.trim();
    const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(val);
    if (val && !/^https:\/\/.+/i.test(val) && !isLocalDev) {
      throw new Error("URL deve usar HTTPS para seguran\xE7a");
    }
    await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", ["server_url", val || DEFAULT_SERVER_URL]);
  }
  async function testarConexaoServidor() {
    const url = await getServerUrl();
    try {
      const res = await fetch(`${url}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5e3)
      });
      if (!res.ok) return { ok: false, motivo: `Servidor respondeu com status ${res.status}` };
      return { ok: true, motivo: `Conectado a ${url}` };
    } catch (e2) {
      return { ok: false, motivo: e2.name === "TimeoutError" ? "Tempo limite excedido (5s)" : `Sem conex\xE3o: ${e2.message}` };
    }
  }
  async function validarChave(chave) {
    try {
      const url = await getServerUrl();
      const normalizedKey = chave.trim().toUpperCase();
      const deviceFingerprint = await gerarDeviceFingerprint();
      const res = await fetch(`${url}/api/v2/ativar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": navigator.userAgent
        },
        body: JSON.stringify({
          chave: normalizedKey,
          device_uuid: await getDeviceUuid(),
          device_fingerprint: deviceFingerprint,
          play_integrity_token: null
          // Implementar Play Integrity quando disponível
        }),
        signal: AbortSignal.timeout(1e4)
      });
      const data = await res.json();
      if (!data.valido) {
        return { valido: false, motivo: data.motivo || "Erro na valida\xE7\xE3o" };
      }
      if (data.session_token) {
        await run(
          "INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)",
          ["session_token", data.session_token]
        );
        await run(
          "INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)",
          ["session_exp", data.session_exp || ""]
        );
        await run(
          "INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)",
          ["license_origin", "server"]
        );
      }
      return {
        valido: true,
        tipo: data.tipo,
        email: data.email,
        exp: data.exp,
        tipoLabel: getTipoLabel(data.tipo)
      };
    } catch (e2) {
      console.error("Erro na valida\xE7\xE3o:", e2);
      return { valido: false, motivo: "Erro de conex\xE3o com servidor: " + e2.message };
    }
  }
  async function validarSessao() {
    try {
      const tokenRows = await query("SELECT valor FROM config WHERE chave = 'session_token'");
      if (tokenRows.length === 0) return { valido: false, motivo: "Nenhuma sess\xE3o ativa" };
      const sessionToken = tokenRows[0].valor;
      const expRows = await query("SELECT valor FROM config WHERE chave = 'session_exp'");
      const exp = expRows.length > 0 ? parseInt(expRows[0].valor) : null;
      if (exp && Date.now() > exp) {
        await run("DELETE FROM config WHERE chave IN ('session_token', 'session_exp')");
        return { valido: false, motivo: "Sess\xE3o expirada" };
      }
      const url = await getServerUrl();
      try {
        const res = await fetch(`${url}/api/v2/validar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_token: sessionToken,
            device_uuid: await getDeviceUuid()
          }),
          signal: AbortSignal.timeout(5e3)
        });
        const data = await res.json();
        if (!data.valido) {
          await run("DELETE FROM config WHERE chave IN ('session_token', 'session_exp')");
          return { valido: false, motivo: data.motivo };
        }
        return {
          valido: true,
          tipo: data.tipo,
          exp: data.exp
        };
      } catch {
        return {
          valido: true,
          tipo: "offline",
          exp
        };
      }
    } catch (e2) {
      return { valido: false, motivo: e2.message };
    }
  }
  async function getDeviceUuid() {
    const rows = await query("SELECT valor FROM config WHERE chave = 'device_uuid'");
    if (rows.length > 0) return rows[0].valor;
    const uuid = crypto.randomUUID();
    await run("INSERT INTO config (chave, valor) VALUES (?, ?)", ["device_uuid", uuid]);
    return uuid;
  }
  async function gerarDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
    const canvasData = canvas.toDataURL();
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasData.slice(-50)
      // Últimos 50 chars do hash
    };
    const str = JSON.stringify(fingerprint);
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b2) => b2.toString(16).padStart(2, "0")).join("");
    return hash.slice(0, 64);
  }
  function getTipoLabel(tipo) {
    const labels = {
      trial: "Trial",
      single: "Perp\xE9tua (1 dispositivo)",
      enterprise: "Enterprise (ilimitado)",
      custom: "Personalizado"
    };
    return labels[tipo] || tipo;
  }
  async function isAtivado() {
    const sessao = await validarSessao();
    if (sessao.valido) return true;
    const keyRows = await query("SELECT valor FROM config WHERE chave = 'license_key'");
    if (keyRows.length === 0) return false;
    const result = await validarChave(keyRows[0].valor);
    return result.valido;
  }
  async function ativarChave(key) {
    const normalizedKey = key.trim().toUpperCase();
    await run("INSERT OR REPLACE INTO config (chave, valor) VALUES (?, ?)", ["license_key", normalizedKey]);
    const result = await validarChave(normalizedKey);
    if (!result.valido) {
      await run("DELETE FROM config WHERE chave = 'license_key'");
      return result;
    }
    return result;
  }

  // src/lib/security.js
  init_dist();
  async function isDeviceCompromised() {
    if (Capacitor.getPlatform() !== "android") {
      return false;
    }
    try {
      const indicators = await checkDeviceIndicators();
      return indicators.isCompromised;
    } catch (e2) {
      console.error("Erro na detec\xE7\xE3o de root:", e2);
      return false;
    }
  }
  async function checkDeviceIndicators() {
    const indicators = {
      isRooted: false,
      reasons: []
    };
    const buildChecks = await checkBuildProps();
    if (buildChecks.isRooted) {
      indicators.isRooted = true;
      indicators.reasons.push(...buildChecks.reasons);
    }
    const pathChecks = await checkRootPaths();
    if (pathChecks.isRooted) {
      indicators.isRooted = true;
      indicators.reasons.push(...pathChecks.reasons);
    }
    const suCheck = await checkSuBinary();
    if (suCheck.isRooted) {
      indicators.isRooted = true;
      indicators.reasons.push(...suCheck.reasons);
    }
    const appCheck = await checkRootApps();
    if (appCheck.isRooted) {
      indicators.isRooted = true;
      indicators.reasons.push(...appCheck.reasons);
    }
    const debugCheck = await checkDebuggable();
    if (debugCheck.isDebuggable) {
      indicators.reasons.push("App rodando em modo debug");
    }
    return {
      isCompromised: indicators.isRooted,
      reasons: indicators.reasons,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function checkBuildProps() {
    const reasons = [];
    let isRooted = false;
    const suspiciousProps = [
      "ro.build.tags=test-keys",
      "ro.debuggable=1",
      "ro.secure=0"
    ];
    try {
      const result = await window.Capacitor?.Plugins?.DeviceInfo?.getBuildProps?.({
        props: suspiciousProps
      });
      if (result?.props) {
        for (const [prop, value] of Object.entries(result.props)) {
          if (value && (value.includes("test-keys") || value === "1" || value === "0")) {
            if (prop === "ro.build.tags" && value === "test-keys") {
              isRooted = true;
              reasons.push(`Build tag: ${value}`);
            }
            if (prop === "ro.debuggable" && value === "1") {
              isRooted = true;
              reasons.push(`Debuggable: ${value}`);
            }
          }
        }
      }
    } catch (e2) {
      console.log("DeviceInfo plugin n\xE3o dispon\xEDvel");
    }
    return { isRooted, reasons };
  }
  async function checkRootPaths() {
    const reasons = [];
    let isRooted = false;
    const rootPaths = [
      "/system/app/Superuser.apk",
      "/sbin/su",
      "/system/bin/su",
      "/system/xbin/su",
      "/system/sbin/su",
      "/system/bin/.ext/su",
      "/system/usr/we-need-root/su",
      "/system/app/Kinguser.apk",
      "/data/adb/magisk",
      "/sbin/.magisk",
      "/cache/.disable_magisk",
      "/dev/.magisk.unblock",
      "/cache/magisk.log",
      "/data/adb/magisk.img",
      "/data/adb/magisk.db"
    ];
    try {
      const result = await window.Capacitor?.Plugins?.Filesystem?.checkPaths?.({
        paths: rootPaths.slice(0, 10)
        // Verificar primeiros 10
      });
      if (result?.found) {
        isRooted = true;
        reasons.push(`Arquivos de root encontrados: ${result.found.length} paths`);
      }
    } catch (e2) {
      console.log("Filesystem check n\xE3o dispon\xEDvel");
    }
    return { isRooted, reasons };
  }
  async function checkSuBinary() {
    let isRooted = false;
    const reasons = [];
    try {
      const result = await window.Capacitor?.Plugins?.RootChecker?.checkSu?.();
      if (result?.hasSu) {
        isRooted = true;
        reasons.push("Binary su encontrado");
      }
    } catch (e2) {
    }
    return { isRooted, reasons };
  }
  async function checkRootApps() {
    const reasons = [];
    let isRooted = false;
    const rootApps = [
      "com.noshufou.android.su",
      "com.noshufou.android.su.elite",
      "eu.chainfire.supersu",
      "com.koushikdutta.superuser",
      "com.thirdparty.superuser",
      "com.yellowes.su",
      "com.koushikdutta.rommanager",
      "com.koushikdutta.rommanager.license",
      "com.dimonvideo.luckypatcher",
      "com.chelpus.lackypatch",
      "com.ramdroid.appquarantine",
      "com.ramdroid.appquarantinepro",
      "com.topjohnwu.magisk",
      "com.kingroot.kinguser",
      "com.kingo.root",
      "com.smedialink.oneclickroot",
      "com.zhuiyi.chenguang.manager",
      "com.trigonic.apptools",
      "org.adaway",
      "com.matthewtyler.android.norootforroot",
      "io.changy.stable"
    ];
    try {
      const result = await window.Capacitor?.Plugins?.PackageChecker?.checkPackages?.({
        packages: rootApps
      });
      if (result?.installed) {
        isRooted = true;
        reasons.push(`Apps de root instalados: ${result.installed.length}`);
      }
    } catch (e2) {
      console.log("PackageChecker n\xE3o dispon\xEDvel");
    }
    return { isRooted, reasons };
  }
  async function checkDebuggable() {
    let isDebuggable = false;
    try {
      const result = await window.Capacitor?.Plugins?.DeviceInfo?.getDebuggable?.();
      isDebuggable = result?.isDebuggable || false;
    } catch (e2) {
      isDebuggable = window.navigator.webdriver || false;
    }
    return { isDebuggable };
  }
  async function verifyAppIntegrity() {
    if (Capacitor.getPlatform() !== "android") {
      return { valid: true };
    }
    try {
      const result = await window.Capacitor?.Plugins?.AppIntegrity?.verify?.();
      return {
        valid: result?.valid || false,
        signature: result?.signature,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (e2) {
      return { valid: true, error: e2.message };
    }
  }

  // src/app.js
  var usuarioAtual = null;
  var licenseInfo = null;
  var deviceSecure = true;
  function fmt(n2) {
    return "R$ " + Number(n2).toFixed(2).replace(".", ",");
  }
  var hojeISO = () => (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  var $ = (id) => document.getElementById(id);
  var v2 = (id) => $(id).value;
  function esc(val) {
    return String(val).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function erroHtml(m2) {
    return '<div class="erro">' + esc(m2) + "</div>";
  }
  function sucessoHtml(m2) {
    return '<div class="sucesso">' + esc(m2) + "</div>";
  }
  function tabela(elId, dados, colunas, botoes) {
    const el = $(elId);
    if (!dados || dados.length === 0) {
      el.innerHTML = '<span class="vazio">Nenhum registro encontrado.</span>';
      return;
    }
    const hasActions = botoes && botoes.length > 0;
    let h3 = "<table><tr>" + colunas.map((c2) => "<th>" + esc(c2.rotulo) + "</th>").join("");
    if (hasActions) h3 += '<th class="th-actions">A\xE7\xF5es</th>';
    h3 += "</tr>";
    dados.forEach((d2) => {
      h3 += "<tr>" + colunas.map((c2) => {
        let val = d2[c2.chave];
        if (c2.formato === "moeda") val = fmt(val);
        else if (c2.formato === "data") val = val ? val.split("T")[0] : "-";
        else if (c2.formato === "simnao") val = val ? "Sim" : "N\xE3o";
        return "<td>" + esc(val ?? "-") + "</td>";
      }).join("");
      if (hasActions) h3 += '<td class="td-actions">' + botoes.map((b2) => `<button class="btn btn-sm ${b2.classe || "btn-ghost"}" data-action="${b2.acao}" data-id="${d2.id}">${b2.rotulo}</button>`).join("") + "</td>";
      h3 += "</tr>";
    });
    h3 += "</table>";
    el.innerHTML = h3;
  }
  function mostrarAtivacao() {
    document.getElementById("app-ativacao").style.display = "flex";
    document.getElementById("app-login").style.display = "none";
    document.getElementById("app-main").style.display = "none";
  }
  function mostrarLogin() {
    document.getElementById("app-ativacao").style.display = "none";
    document.getElementById("app-login").style.display = "flex";
    document.getElementById("app-main").style.display = "none";
  }
  function mostrarMain() {
    document.getElementById("app-ativacao").style.display = "none";
    document.getElementById("app-login").style.display = "none";
    document.getElementById("app-main").style.display = "flex";
  }
  async function handleAtivacao(e2) {
    e2.preventDefault();
    const key = v2("ativacao-chave");
    const erro = $("erro-ativacao");
    const serverUrlInput = $("ativacao-server-url");
    if (serverUrlInput?.value.trim()) {
      try {
        await setServerUrl(serverUrlInput.value);
      } catch (err2) {
        erro.textContent = err2.message;
        return;
      }
    }
    const result = await ativarChave(key);
    if (!result.valido) {
      erro.textContent = result.motivo;
      return;
    }
    licenseInfo = result;
    mostrarLogin();
  }
  window.handleAtivacao = handleAtivacao;
  var ALLOWED_ACTIONS = /* @__PURE__ */ new Set([
    "lancarSaidaRapida",
    "lancarShowRapido",
    "abrirCaixa",
    "fecharCaixa",
    "excluirCaixa",
    "listarCaixas",
    "lancarSaida",
    "verSaidas",
    "excluirSaida",
    "cadastrarDancarina",
    "listarDancarinas",
    "editarDancarina",
    "excluirDancarina",
    "carregarDancarinasSelect",
    "lancarShow",
    "verShows",
    "excluirShow",
    "cadastrarFuncionario",
    "listarFuncionarios",
    "excluirFuncionario",
    "carregarPessoasVale",
    "cadastrarVale",
    "listarVales",
    "pagarVale",
    "excluirVale",
    "relSaidas",
    "relResumo",
    "relTotalDancarinas",
    "exportarCSV",
    "gerarPDF",
    "imprimir",
    "voltarPainel",
    "abrirPainel",
    "abrirAbaDancarinas",
    "toggleSidebar",
    "sair",
    "salvarConfigServidor",
    "testarConexaoServidor",
    "carregarOperacao",
    "cancelarEdicaoDanca"
  ]);
  document.addEventListener("click", async (e2) => {
    const btn = e2.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (ALLOWED_ACTIONS.has(action) && typeof window[action] === "function") {
      await window[action](e2, id);
    }
  });
  document.addEventListener("change", (e2) => {
    if (e2.target.id === "v-tipo") carregarPessoasVale();
  });
  var loginAttempts = 0;
  var loginBlockedUntil = 0;
  async function handleLogin(e2) {
    e2.preventDefault();
    const now = Date.now();
    if (now < loginBlockedUntil) {
      const s2 = Math.ceil((loginBlockedUntil - now) / 1e3);
      $("erro-login").textContent = `Aguarde ${s2}s para nova tentativa`;
      return;
    }
    const username = v2("login-usuario");
    const password = v2("login-senha");
    const erro = $("erro-login");
    if (!licenseInfo && !await isAtivado()) {
      erro.textContent = "Ative sua licen\xE7a antes de entrar";
      mostrarAtivacao();
      return;
    }
    const totalUsers = await query("SELECT COUNT(*) as total FROM usuarios");
    if (totalUsers[0]?.total === 0) {
      if (username.length < 3 || password.length < 8) {
        erro.textContent = "Primeiro acesso: use usu\xE1rio com 3+ caracteres e senha com 8+ caracteres";
        return;
      }
      const { salt, hash } = await hashPassword(password);
      await run(
        "INSERT INTO usuarios (username, salt, hash, role, nome_completo, ativo) VALUES (?, ?, ?, 'admin', ?, 1)",
        [username, salt, hash, "Administrador"]
      );
    }
    const users = await query("SELECT * FROM usuarios WHERE username = ? AND ativo = 1", [username]);
    if (users.length === 0) {
      loginAttempts++;
      if (loginAttempts >= 5) {
        loginBlockedUntil = Date.now() + 3e4;
        loginAttempts = 0;
      }
      erro.textContent = "Usu\xE1rio ou senha incorretos";
      return;
    }
    const user = users[0];
    const ok2 = await verifyPassword(password, user.salt, user.hash);
    if (!ok2) {
      loginAttempts++;
      if (loginAttempts >= 5) {
        loginBlockedUntil = Date.now() + 3e4;
        loginAttempts = 0;
      }
      erro.textContent = "Usu\xE1rio ou senha incorretos";
      return;
    }
    loginAttempts = 0;
    usuarioAtual = user;
    mostrarMain();
    if (licenseInfo) {
      $("license-info").textContent = `${licenseInfo.tipoLabel} \u2022 ${licenseInfo.email || ""}`;
    }
    inicializarApp();
  }
  window.handleLogin = handleLogin;
  function sair() {
    usuarioAtual = null;
    mostrarLogin();
  }
  window.sair = sair;
  function toggleSidebar() {
    $("sidebar").classList.toggle("aberta");
    $("sidebar-overlay").classList.toggle("visivel");
  }
  window.toggleSidebar = toggleSidebar;
  function abrirAbaDancarinas(aba) {
    document.querySelectorAll(".sub-dancarinas-cadastro, .sub-dancarinas-lancar, .sub-dancarinas-shows-dia").forEach((el) => el.classList.remove("ativo"));
    document.querySelectorAll(".tab-btn[data-tab]").forEach((el) => el.classList.remove("ativo"));
    const map2 = { cadastro: "sub-dancarinas-cadastro", lancar: "sub-dancarinas-lancar", "shows-dia": "sub-dancarinas-shows-dia" };
    const target = map2[aba] || "sub-dancarinas-cadastro";
    document.querySelector(`.${target}`)?.classList.add("ativo");
    document.querySelector(`.tab-btn[data-tab="${aba}"]`)?.classList.add("ativo");
    if (aba === "lancar") {
      carregarDancarinasSelect("sh-danc");
    }
    if (aba === "shows-dia") verShows();
  }
  window.abrirAbaDancarinas = abrirAbaDancarinas;
  function abrirPainel(nome) {
    document.querySelectorAll(".nav-btn").forEach((b2) => b2.classList.remove("ativo"));
    document.querySelectorAll(".painel").forEach((p2) => p2.classList.remove("ativo"));
    document.querySelector(`.nav-btn[data-painel="${nome}"]`).classList.add("ativo");
    $(`#p-${nome}`).classList.add("ativo");
    const titulos = { operacao: "\u26A1 Opera\xE7\xE3o", caixa: "\u{1F4B0} Caixa", saidas: "\u{1F4E4} Sa\xEDdas", dancarinas: "\u{1F483} Dan\xE7arinas / Shows", funcionarios: "\u{1F465} Funcion\xE1rios", vales: "\u{1F4B3} Vales", relatorios: "\u{1F4CA} Relat\xF3rios", config: "\u2699\uFE0F Configura\xE7\xF5es" };
    $("titulo-pagina").textContent = titulos[nome] || nome;
    if (nome === "operacao") {
      carregarDancarinasSelect("op-sh-danc");
      carregarOperacao();
    }
    if (nome === "dancarinas") carregarDancarinasSelect();
    if (nome === "vales") carregarPessoasVale();
    if (nome === "config") carregarConfig();
  }
  window.abrirPainel = abrirPainel;
  async function carregarOperacao() {
    const data = v2("op-data") || hojeISO();
    try {
      const res = await getResumoOperacao(data);
      $("op-entradas").textContent = fmt(res.entradas);
      $("op-saidas").textContent = fmt(res.totalSaidas);
      $("op-saldo").textContent = fmt(res.saldoPrevisto);
      $("op-shows").textContent = res.totalShows;
      $("op-valor-shows").textContent = fmt(res.totalShowsValor);
      $("op-comissao").textContent = fmt(res.totalComissao);
      $("op-vales").textContent = fmt(res.valesPendentes);
      $("op-linha").textContent = res.proximaLinha;
      $("op-diferenca").textContent = res.diferenca != null ? fmt(res.diferenca) : "-";
      $("op-status").textContent = res.caixa ? "Caixa Aberto" : "Sem Caixa";
      $("op-status").className = "badge " + (res.caixa ? "badge-success" : "badge-warning");
      const geral = $("op-comissoes-geral");
      geral.innerHTML = res.comissoes.map(
        (d2) => `<div class="comissao-item"><span>${esc(d2.nome)}</span><span>${fmt(d2.comissao_calculada)}</span></div>`
      ).join("");
      $("op-ultimos").innerHTML = res.ultimos.length ? res.ultimos.map((u2) => `<div class="lancamento-item"><span>${u2.tipo === "saida" ? "\u{1F4E4}" : "\u{1F483}"}</span><span>${esc(u2.descricao || u2.categoria)}</span><span>${fmt(u2.valor)}</span></div>`).join("") : '<span class="vazio">Nenhum lan\xE7amento hoje.</span>';
      $("op-comissoes").innerHTML = res.comissoes.length ? res.comissoes.map((d2) => `<div class="comissao-item"><span>${esc(d2.nome)}</span><span>${fmt(d2.comissao_calculada)}</span></div>`).join("") : '<span class="vazio">Nenhuma dan\xE7a no dia.</span>';
      $("op-comissoes-qtd").textContent = res.comissoes.length + " dan\xE7arinas";
    } catch (err2) {
      $("op-alerta").innerHTML = erroHtml(err2.message);
    }
  }
  window.carregarOperacao = carregarOperacao;
  async function lancarSaidaRapida() {
    const data = v2("op-data") || hojeISO();
    try {
      await criarSaida(data, {
        categoria: v2("op-s-cat"),
        valor: parseFloat(v2("op-s-val")),
        descricao: v2("op-s-desc")
      }, usuarioAtual?.id);
      $("op-s-val").value = "";
      $("op-s-desc").value = "";
      await carregarOperacao();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.lancarSaidaRapida = lancarSaidaRapida;
  async function lancarShowRapido() {
    const data = v2("op-data") || hojeISO();
    try {
      await criarShow(data, {
        dancarina_ids: [parseInt(v2("op-sh-danc"))],
        numero_linha: parseInt(v2("op-sh-linha")),
        valor_show: parseFloat(v2("op-sh-valor")),
        quartos: parseInt(v2("op-sh-quartos")),
        tempo: v2("op-sh-preset") === "custom" ? "Personalizado" : v2("op-sh-preset") + " min",
        hora_entrada: v2("op-sh-hrin") || null,
        hora_saida: v2("op-sh-hrout") || null,
        tipo: v2("op-sh-tipo")
      }, usuarioAtual?.id);
      await carregarOperacao();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.lancarShowRapido = lancarShowRapido;
  async function abrirCaixa2() {
    try {
      await abrirCaixa({
        data: v2("cx-data") || hojeISO(),
        troco_inicial: parseFloat(v2("cx-troco")) || 0,
        comanda_inicio: parseInt(v2("cx-comanda-inicio")) || null,
        criado_por: usuarioAtual?.id
      });
      await listarCaixas2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.abrirCaixa = abrirCaixa2;
  async function listarCaixas2() {
    try {
      const res = await listarCaixas();
      tabela("r-caixa", res.data, [
        { rotulo: "Data", chave: "data" },
        { rotulo: "Troco", chave: "troco_inicial", formato: "moeda" },
        { rotulo: "Comandas", chave: "total_comandas", formato: "moeda" },
        { rotulo: "Cart\xF5es", chave: "total_cartoes", formato: "moeda" },
        { rotulo: "Dinheiro", chave: "total_especies", formato: "moeda" },
        { rotulo: "Sa\xEDdas", chave: "valor_saidas", formato: "moeda" },
        { rotulo: "Diferen\xE7a", chave: "diferenca_caixa", formato: "moeda" },
        { rotulo: "Fechado", chave: "fechado_em" }
      ], [
        { rotulo: "Excluir", acao: "excluirCaixa", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.listarCaixas = listarCaixas2;
  async function fecharCaixa2() {
    try {
      await fecharCaixa(v2("cx-fecha-data") || hojeISO(), {
        total_comandas: parseFloat(v2("cx-com")) || 0,
        total_cartoes: parseFloat(v2("cx-car")) || 0,
        total_especies: parseFloat(v2("cx-esp")) || 0,
        comanda_fim: parseInt(v2("cx-comanda-fim")) || null,
        dinheiro_contado: parseFloat(v2("cx-dinheiro")) || null,
        responsavel_fechamento: v2("cx-responsavel"),
        observacao: v2("cx-obs")
      });
      await listarCaixas2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.fecharCaixa = fecharCaixa2;
  async function excluirCaixa2(e2, id) {
    if (!confirm("Excluir caixa deste dia?")) return;
    try {
      await excluirCaixa(id);
      await listarCaixas2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirCaixa = excluirCaixa2;
  async function lancarSaida() {
    const data = v2("s-data") || hojeISO();
    try {
      await criarSaida(data, {
        categoria: v2("s-cat"),
        valor: parseFloat(v2("s-val")),
        descricao: v2("s-desc")
      }, usuarioAtual?.id);
      await verSaidas();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.lancarSaida = lancarSaida;
  async function verSaidas() {
    const data = v2("s-data") || hojeISO();
    try {
      const rows = await listarSaidas(data);
      tabela("r-saidas", rows, [
        { rotulo: "Categoria", chave: "categoria" },
        { rotulo: "Valor", chave: "valor", formato: "moeda" },
        { rotulo: "Descri\xE7\xE3o", chave: "descricao" },
        { rotulo: "Criado por", chave: "criado_por_nome" }
      ], [
        { rotulo: "Excluir", acao: "excluirSaida", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.verSaidas = verSaidas;
  async function excluirSaida2(e2, id) {
    if (!confirm("Excluir esta sa\xEDda?")) return;
    try {
      await excluirSaida(id);
      await verSaidas();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirSaida = excluirSaida2;
  async function cadastrarDancarina() {
    const id = $("btn-cadastrar-danca").dataset.editId;
    const dados = {
      nome: v2("d-nome"),
      telefone: v2("d-tel"),
      comissao: parseFloat(v2("d-comissao")) || 0,
      comissao_percentual: parseFloat(v2("d-comissao-pct")) || 30,
      comissao_danca_percentual: parseFloat(v2("d-comissao-danca-pct")) || 62.5,
      danca_30_nome: v2("d-d1-nome"),
      danca_30_qty: parseInt(v2("d-d1-qty")) || 0,
      danca_30_valor: parseFloat(v2("d-d1-val")) || 160,
      danca_60_nome: v2("d-d2-nome"),
      danca_60_qty: parseInt(v2("d-d2-qty")) || 0,
      danca_60_valor: parseFloat(v2("d-d2-val")) || 320,
      danca_3_nome: v2("d-d3-nome"),
      danca_3_qty: parseInt(v2("d-d3-qty")) || 0,
      danca_3_valor: parseFloat(v2("d-d3-val")) || 0,
      danca_4_nome: v2("d-d4-nome"),
      danca_4_qty: parseInt(v2("d-d4-qty")) || 0,
      danca_4_valor: parseFloat(v2("d-d4-val")) || 0
    };
    try {
      if (id) {
        await atualizarDancarina(parseInt(id), dados);
      } else {
        await criarDancarina(dados);
      }
      await listarDancarinas2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.cadastrarDancarina = cadastrarDancarina;
  async function listarDancarinas2() {
    try {
      const res = await listarDancarinas();
      tabela("r-dancarinas", res.data, [
        { rotulo: "Nome", chave: "nome" },
        { rotulo: "Telefone", chave: "telefone" },
        { rotulo: "Comiss\xE3o", chave: "comissao", formato: "moeda" },
        { rotulo: "Com %", chave: "comissao_percentual", formato: "porcentagem" },
        { rotulo: "Vales Pend.", chave: "vales_pendentes", formato: "moeda" }
      ], [
        { rotulo: "Editar", acao: "editarDancarina", classe: "btn-primary btn-sm" },
        { rotulo: "Excluir", acao: "excluirDancarina", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.listarDancarinas = listarDancarinas2;
  async function editarDancarina(e2, id) {
    try {
      const d2 = await getDancarina(parseInt(id));
      if (!d2) return;
      $("d-nome").value = d2.nome;
      $("d-tel").value = d2.telefone || "";
      $("d-comissao").value = d2.comissao;
      $("d-comissao-pct").value = d2.comissao_percentual;
      $("d-comissao-danca-pct").value = d2.comissao_danca_percentual;
      $("d-d1-nome").value = d2.danca_30_nome;
      $("d-d1-qty").value = d2.danca_30_qty;
      $("d-d1-val").value = d2.danca_30_valor;
      $("d-d2-nome").value = d2.danca_60_nome;
      $("d-d2-qty").value = d2.danca_60_qty;
      $("d-d2-val").value = d2.danca_60_valor;
      $("d-d3-nome").value = d2.danca_3_nome || "";
      $("d-d3-qty").value = d2.danca_3_qty || 0;
      $("d-d3-val").value = d2.danca_3_valor || 0;
      $("d-d4-nome").value = d2.danca_4_nome || "";
      $("d-d4-qty").value = d2.danca_4_qty || 0;
      $("d-d4-val").value = d2.danca_4_valor || 0;
      $("btn-cadastrar-danca").dataset.editId = id;
      $("btn-cadastrar-danca").textContent = "Atualizar";
      $("btn-cancelar-danca").classList.remove("hidden");
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.editarDancarina = editarDancarina;
  function cancelarEdicaoDanca() {
    delete $("btn-cadastrar-danca").dataset.editId;
    $("btn-cadastrar-danca").textContent = "Cadastrar";
    $("btn-cancelar-danca").classList.add("hidden");
  }
  window.cancelarEdicaoDanca = cancelarEdicaoDanca;
  async function excluirDancarina2(e2, id) {
    if (!confirm("Excluir esta dan\xE7arina?")) return;
    try {
      await excluirDancarina(parseInt(id));
      await listarDancarinas2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirDancarina = excluirDancarina2;
  async function carregarDancarinasSelect(elId = "sh-danc") {
    try {
      const rows = await listarDancarinasSelect();
      const sel = $(elId);
      sel.innerHTML = rows.map((d2) => `<option value="${d2.id}">${esc(d2.nome)}</option>`).join("");
    } catch (err2) {
    }
  }
  window.carregarDancarinasSelect = carregarDancarinasSelect;
  async function lancarShow() {
    const data = v2("sh-data") || hojeISO();
    const sel = $("sh-danc");
    const ids = Array.from(sel.selectedOptions).map((o2) => parseInt(o2.value));
    try {
      await criarShow(data, {
        dancarina_ids: ids,
        numero_linha: parseInt(v2("sh-linha")),
        valor_show: parseFloat(v2("sh-valor")),
        quartos: parseInt(v2("sh-quartos")) || 1,
        tempo: v2("sh-tempo"),
        hora_entrada: v2("sh-hrin") || null,
        hora_saida: v2("sh-hrout") || null,
        tipo: v2("sh-tipo")
      }, usuarioAtual?.id);
      await verShows();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.lancarShow = lancarShow;
  async function verShows() {
    const data = v2("sh-data") || hojeISO();
    try {
      const rows = await listarShows(data);
      tabela("r-shows", rows, [
        { rotulo: "Linha", chave: "numero_linha" },
        { rotulo: "Dan\xE7arinas", chave: "dancarina_nomes" },
        { rotulo: "Valor", chave: "valor_show", formato: "moeda" },
        { rotulo: "Quartos", chave: "quartos" },
        { rotulo: "Tipo", chave: "tipo" },
        { rotulo: "Hor\xE1rio", chave: "hora_entrada" }
      ], [
        { rotulo: "Excluir", acao: "excluirShow", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.verShows = verShows;
  async function excluirShow2(e2, id) {
    if (!confirm("Excluir este show?")) return;
    try {
      await excluirShow(parseInt(id));
      await verShows();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirShow = excluirShow2;
  async function cadastrarFuncionario() {
    try {
      await criarFuncionario({
        nome: v2("f-nome"),
        cargo: v2("f-cargo"),
        telefone: v2("f-tel")
      });
      await listarFuncionarios2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.cadastrarFuncionario = cadastrarFuncionario;
  async function listarFuncionarios2() {
    try {
      const res = await listarFuncionarios();
      tabela("r-funcionarios", res.data, [
        { rotulo: "Nome", chave: "nome" },
        { rotulo: "Cargo", chave: "cargo" },
        { rotulo: "Telefone", chave: "telefone" },
        { rotulo: "Vales Pend.", chave: "vales_pendentes", formato: "moeda" }
      ], [
        { rotulo: "Excluir", acao: "excluirFuncionario", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.listarFuncionarios = listarFuncionarios2;
  async function excluirFuncionario2(e2, id) {
    if (!confirm("Excluir este funcion\xE1rio?")) return;
    try {
      await excluirFuncionario(parseInt(id));
      await listarFuncionarios2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirFuncionario = excluirFuncionario2;
  async function carregarPessoasVale() {
    const tipo = v2("v-tipo");
    const sel = $("v-pessoa");
    try {
      const rows = tipo === "dancarina" ? await listarDancarinasSelect() : await listarFuncionarios();
      sel.innerHTML = rows.map((r) => `<option value="${r.id}">${esc(r.nome)}</option>`).join("");
    } catch (err2) {
    }
  }
  window.carregarPessoasVale = carregarPessoasVale;
  async function cadastrarVale() {
    try {
      await criarVale({
        tipo_pessoa: v2("v-tipo"),
        pessoa_id: parseInt(v2("v-pessoa")),
        valor: parseFloat(v2("v-valor")),
        descricao: v2("v-desc"),
        data_valor: v2("v-data") || hojeISO(),
        gerar_saida: v2("v-gerar-saida")
      }, usuarioAtual?.id);
      await listarVales2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.cadastrarVale = cadastrarVale;
  async function listarVales2() {
    try {
      const rows = await listarVales();
      tabela("r-vales", rows, [
        { rotulo: "Tipo", chave: "tipo_pessoa" },
        { rotulo: "Pessoa", chave: "pessoa_nome" },
        { rotulo: "Valor", chave: "valor", formato: "moeda" },
        { rotulo: "Descri\xE7\xE3o", chave: "descricao" },
        { rotulo: "Pago", chave: "pago", formato: "simnao" },
        { rotulo: "Data", chave: "data_valor" }
      ], [
        { rotulo: "Pagar", acao: "pagarVale", classe: "btn-success btn-sm" },
        { rotulo: "Excluir", acao: "excluirVale", classe: "btn-danger btn-sm" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.listarVales = listarVales2;
  async function pagarVale2(e2, id) {
    if (!confirm("Marcar este vale como pago?")) return;
    try {
      await pagarVale(parseInt(id));
      await listarVales2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.pagarVale = pagarVale2;
  async function excluirVale2(e2, id) {
    if (!confirm("Excluir este vale?")) return;
    try {
      await excluirVale(parseInt(id));
      await listarVales2();
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.excluirVale = excluirVale2;
  async function relSaidas() {
    const data = v2("rel-data") || hojeISO();
    try {
      const rows = await saidasPorCategoria(data);
      tabela("r-relatorios", rows, [
        { rotulo: "Categoria", chave: "categoria" },
        { rotulo: "Qtd", chave: "quantidade" },
        { rotulo: "Total", chave: "total", formato: "moeda" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.relSaidas = relSaidas;
  async function relResumo() {
    const data = v2("rel-data") || hojeISO();
    try {
      const res = await resumoCaixa(data);
      if (!res) {
        $("r-relatorios").innerHTML = erroHtml("Nenhum caixa encontrado para esta data.");
        return;
      }
      $("r-relatorios").innerHTML = `
      <div class="resumo-card">
        <div class="resumo-item"><span class="rotulo">\u{1F4C5} Data</span><span class="vd">${res.data}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F4B0} Troco Inicial</span><span class="vd">${fmt(res.troco_inicial)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F37A} Comandas</span><span class="vd">${fmt(res.total_comandas)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F4B3} Cart\xF5es</span><span class="vd">${fmt(res.total_cartoes)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F4B5} Dinheiro</span><span class="vd">${fmt(res.total_especies)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F4E5} Total Entradas</span><span class="vd">${fmt(res.entradas)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F4E4} Total Sa\xEDdas</span><span class="vd primary-text">${fmt(res.totalSaidas)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u2705 Saldo Final</span><span class="vd">${fmt(res.saldo)}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F483} Shows</span><span class="vd">${res.total_shows}</span></div>
        <div class="resumo-item"><span class="rotulo">\u{1F483} Dan\xE7arinas</span><span class="vd">${res.total_dancarinas}</span></div>
        ${res.diferenca_caixa != null ? `<div class="resumo-item"><span class="rotulo">\u{1F4CA} Diferen\xE7a</span><span class="vd">${fmt(res.diferenca_caixa)}</span></div>` : ""}
        ${res.responsavel_fechamento ? `<div class="resumo-item"><span class="rotulo">\u{1F464} Respons\xE1vel</span><span class="vd">${esc(res.responsavel_fechamento)}</span></div>` : ""}
      </div>`;
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.relResumo = relResumo;
  async function relTotalDancarinas() {
    const data = v2("rel-data") || hojeISO();
    try {
      const rows = await totalDancarinas(data);
      tabela("r-relatorios", rows, [
        { rotulo: "Dan\xE7arina", chave: "nome" },
        { rotulo: "Dan\xE7as", chave: "total_dancas" },
        { rotulo: "Valor Total", chave: "valor_total", formato: "moeda" },
        { rotulo: "Quartos", chave: "total_quartos" },
        { rotulo: "FX", chave: "fx_count" },
        { rotulo: "FL", chave: "fl_count" }
      ]);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.relTotalDancarinas = relTotalDancarinas;
  function escCsv(val) {
    const s2 = String(val ?? "");
    if (/^[=+\-@]/.test(s2)) return "'" + s2;
    if (s2.includes(",") || s2.includes('"') || s2.includes("\n")) return '"' + s2.replace(/"/g, '""') + '"';
    return s2;
  }
  async function exportarCSV() {
    const data = v2("rel-data") || hojeISO();
    try {
      const [saidas, resumo, dancarinas] = await Promise.all([
        saidasPorCategoria(data),
        resumoCaixa(data),
        totalDancarinas(data)
      ]);
      let csv = "=== SA\xCDDAS POR CATEGORIA ===\nCategoria,Quantidade,Total\n";
      csv += saidas.map((s2) => `${escCsv(s2.categoria)},${s2.quantidade},${s2.total}`).join("\n");
      csv += "\n\n=== RESUMO CAIXA ===\n";
      if (resumo) csv += Object.entries(resumo).map(([k2, v3]) => `${escCsv(k2)},${escCsv(v3)}`).join("\n");
      csv += "\n\n=== TOTAL DAN\xC7ARINAS ===\nDan\xE7arina,Dan\xE7as,Valor,Quartos\n";
      csv += dancarinas.map((d2) => `${escCsv(d2.nome)},${d2.total_dancas},${d2.valor_total},${d2.total_quartos}`).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = url;
      a2.download = `relatorio-${data}.csv`;
      a2.click();
      URL.revokeObjectURL(url);
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.exportarCSV = exportarCSV;
  async function gerarPDF() {
    const data = v2("cx-fecha-data") || hojeISO();
    try {
      const [resumo, saidas, financeiro] = await Promise.all([
        resumoCaixa(data),
        saidasPorCategoria(data),
        financeiroDancarinas(data)
      ]);
      if (!resumo) {
        alert("Nenhum caixa encontrado para esta data.");
        return;
      }
      $("print-data").textContent = (/* @__PURE__ */ new Date(data + "T12:00:00")).toLocaleDateString("pt-BR");
      $("p-data").textContent = resumo.data;
      $("p-troco").textContent = fmt(resumo.troco_inicial);
      $("p-comandas").textContent = fmt(resumo.total_comandas);
      $("p-comanda-inicio").textContent = resumo.comanda_inicio ?? "-";
      $("p-comanda-fim").textContent = resumo.comanda_fim ?? "-";
      $("p-cartoes").textContent = fmt(resumo.total_cartoes);
      $("p-especies").textContent = fmt(resumo.total_especies);
      $("p-entradas").textContent = fmt(resumo.entradas);
      $("p-saidas-val").textContent = fmt(resumo.totalSaidas);
      $("p-saldo").textContent = fmt(resumo.saldo);
      tabela("p-print-saidas", saidas, [
        { rotulo: "Categoria", chave: "categoria" },
        { rotulo: "Qtd", chave: "quantidade" },
        { rotulo: "Total", chave: "total", formato: "moeda" }
      ]);
      if (financeiro.length > 0) {
        $("p-print-dancarinas").innerHTML = financeiro.map(
          (d2) => `<div class="comissao-item">
          <span>${esc(d2.nome)}</span>
          <span>${d2.total_dancas} dan\xE7as | ${fmt(d2.valor_shows)} | Comiss\xE3o: ${fmt(d2.comissao_calculada)} | Vales: ${fmt(d2.total_vales)} | Receber: ${fmt(d2.valor_a_receber)}</span>
        </div>`
        ).join("<hr>");
      } else {
        $("p-print-dancarinas").innerHTML = '<span class="vazio">Nenhuma dan\xE7arina.</span>';
      }
      $("print-gerado-em").textContent = (/* @__PURE__ */ new Date()).toLocaleString("pt-BR");
      abrirPainel("print");
    } catch (err2) {
      alert(err2.message);
    }
  }
  window.gerarPDF = gerarPDF;
  function imprimir() {
    window.print();
  }
  window.imprimir = imprimir;
  function voltarPainel() {
    abrirPainel("caixa");
  }
  window.voltarPainel = voltarPainel;
  function atualizarData() {
    $("data-atual").textContent = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  function inicializarApp() {
    atualizarData();
    document.querySelectorAll('input[type="date"]').forEach((el) => {
      if (!el.value) el.value = hojeISO();
    });
    carregarOperacao();
    carregarDancarinasSelect("op-sh-danc");
  }
  async function carregarConfig() {
    try {
      const url = await getServerUrl();
      $("cfg-server-url").value = url;
      if (licenseInfo) {
        $("cfg-lic-tipo").textContent = licenseInfo.tipoLabel || licenseInfo.tipo || "-";
        $("cfg-lic-email").textContent = licenseInfo.email || "-";
        $("cfg-lic-exp").textContent = licenseInfo.exp ? new Date(licenseInfo.exp).toLocaleDateString("pt-BR") : "Nunca expira";
      }
      const originRows = await query("SELECT valor FROM config WHERE chave = 'license_origin'");
      $("cfg-lic-origem").textContent = originRows.length > 0 ? originRows[0].valor === "server" ? "Servidor online \u2705" : "Local (offline) \u{1F512}" : "-";
    } catch (e2) {
      $("cfg-status").innerHTML = erroHtml("Erro ao carregar: " + e2.message);
    }
  }
  async function salvarConfigServidor() {
    const url = $("cfg-server-url").value.trim();
    const status = $("cfg-status");
    try {
      await setServerUrl(url);
      status.innerHTML = sucessoHtml("URL salva com sucesso!");
    } catch (e2) {
      status.innerHTML = erroHtml(e2.message);
    }
  }
  window.salvarConfigServidor = salvarConfigServidor;
  async function handleTestarConexao() {
    const status = $("cfg-status");
    status.innerHTML = '<span style="color:#f0b429">Testando conex\xE3o...</span>';
    const res = await testarConexaoServidor();
    status.innerHTML = res.ok ? sucessoHtml(res.motivo) : erroHtml(res.motivo);
  }
  window.testarConexaoServidor = handleTestarConexao;
  async function init2() {
    try {
      const securityCheck = await isDeviceCompromised();
      if (securityCheck) {
        document.body.innerHTML = `
        <div style="padding:40px;color:#ff3b6f;text-align:center;max-width:500px;margin:0 auto">
          <h2>\u26A0\uFE0F Dispositivo N\xE3o Seguro</h2>
          <p style="color:#9898b0;margin:20px 0">
            Detectamos que este dispositivo pode estar comprometido (root/jailbreak).
            Por seguran\xE7a, o Bimbar n\xE3o pode ser executado neste ambiente.
          </p>
          <p style="color:#666;font-size:14px">
            Se voc\xEA acredita que isso \xE9 um erro, entre em contato com o suporte.
          </p>
        </div>
      `;
        return;
      }
      deviceSecure = true;
      const integrityCheck = await verifyAppIntegrity();
      if (!integrityCheck.valid) {
        document.body.innerHTML = `
        <div style="padding:40px;color:#ff3b6f;text-align:center;max-width:500px;margin:0 auto">
          <h2>\u26A0\uFE0F Aplicativo Modificado</h2>
          <p style="color:#9898b0;margin:20px 0">
            A integridade do aplicativo n\xE3o p\xF4de ser verificada.
            Por favor, reinstale o app da fonte oficial.
          </p>
        </div>
      `;
        return;
      }
      await initDatabase();
      if (await isAtivado()) {
        const rows = await query("SELECT valor FROM config WHERE chave = ?", ["license_key"]);
        if (rows.length > 0) {
          const result = await validarChave(rows[0].valor);
          if (result.valido) {
            licenseInfo = result;
            mostrarLogin();
            return;
          }
        }
      }
      mostrarAtivacao();
    } catch (err2) {
      console.error("Erro ao iniciar:", err2);
      document.body.innerHTML = `<div style="padding:40px;color:red">Erro ao iniciar: ${esc(err2.message)}</div>`;
    }
  }
  init2();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)

jeep-sqlite/dist/esm/jeep-sqlite.entry.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)
  (*!
      localForage -- Offline Storage, Improved
      Version 1.10.0
      https://localforage.github.io/localForage
      (c) 2013-2017 Mozilla, Apache License 2.0
  *)
*/
