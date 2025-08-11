import { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropDown";
import LanguagesDropdown from "./LanguageDropdown";

const Landing = () => {
  const [code, setCode] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");
  const [outputDetails, setOutputDetails] = useState<any>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [theme, setTheme] = useState<{ value: string; label: string }>({
    value: "cobalt",
    label: "Cobalt",
  });
  const [language, setLanguage] = useState<any>(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl: any) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action: string, data: string) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  const handleCompile = () => {
    setProcessing(true);

    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };

    console.log("Submitting code:", { formData, language: language.name });

    const options = {
      method: "POST",
      url: import.meta.env.VITE_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("Submit response:", response.data);
        if (response.data && response.data.token) {
          const token = response.data.token;
          checkStatus(token);
        } else {
          console.error("No token received in response:", response.data);
          showErrorToast("Invalid response from server", 5000);
          setProcessing(false);
        }
      })
      .catch((err) => {
        console.error("Submit error:", err);
        setProcessing(false);

        // Comprehensive error handling to avoid undefined property access
        let errorMessage = "Something went wrong";
        let status = null;

        try {
          if (err && typeof err === "object") {
            if (err.response) {
              // Server responded with error status
              status = err.response.status || null;
              if (
                err.response.data &&
                typeof err.response.data === "object" &&
                err.response.data.message
              ) {
                errorMessage = err.response.data.message;
              } else if (err.response.statusText) {
                errorMessage = err.response.statusText;
              }
            } else if (err.request) {
              // Network error
              errorMessage = "Network error - please check your connection";
            } else if (err.message && typeof err.message === "string") {
              // Other error with message
              errorMessage = err.message;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error object:", parseError);
          errorMessage = "Unknown error occurred";
        }

        console.log("Error status:", status);
        console.log("Error message:", errorMessage);

        if (status === 403) {
          showErrorToast(
            `API Subscription Required: Please visit https://rapidapi.com/judge0-official/api/judge0-ce and subscribe to the Judge0 API (free tier available)`,
            15000
          );

          // Fall back to mock response for testing
          console.log(
            "Falling back to mock response due to API subscription issue"
          );
          setTimeout(() => {
            const mockResponse = {
              stdout: btoa("Hello World!\n42\n"),
              stderr: null,
              compile_output: null,
              status: {
                id: 3,
                description: "Accepted (Mock Response)",
              },
              time: "0.001",
              memory: 1024,
            };
            setOutputDetails(mockResponse);
            setProcessing(false);
            showSuccessToast(
              "Code executed successfully! (Mock response - please subscribe to API for real execution)"
            );
          }, 1000);
        } else if (status === 429) {
          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        } else {
          showErrorToast(`Error: ${errorMessage}`, 5000);
        }
      });
  };

  const checkStatus = async (token: string) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
      },
    };
    try {
      console.log("Checking status for token:", token);
      let response = await axios.request(options);
      console.log("Status check response:", response.data);

      if (!response.data) {
        console.error("No data in response");
        setProcessing(false);
        showErrorToast("No data received from server", 5000);
        return;
      }

      let statusId = response.data.status?.id;
      console.log("Status ID:", statusId);

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        console.log("Still processing, checking again in 2 seconds...");
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("Final response.data", response.data);
        return;
      }
    } catch (err) {
      console.error("Status check error:", err);
      setProcessing(false);
      showErrorToast("Error checking execution status", 5000);
    }
  };

  function handleThemeChange(th: any) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_: any) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_: any) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg: string) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg: string, timer: number) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>

      {/* Top Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-row items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Language:</span>
            <LanguagesDropdown onSelectChange={onSelectChange} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Theme:</span>
            <ThemeDropdown
              handleThemeChange={handleThemeChange}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Code Editor Section */}
        <div className="flex-1 lg:w-[70%] p-6">
          <div className="h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <h2 className="text-sm font-medium text-gray-700">Code Editor</h2>
            </div>
            <div className="h-[calc(100%-40px)]">
              <CodeEditorWindow
                code={code}
                onChange={onChange}
                language={language?.value}
                theme={theme.value}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Output & Controls */}
        <div className="w-full lg:w-[30%] p-6 lg:pl-0">
          <div className="flex flex-col space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto pb-4">
            {/* Output Window */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
              <OutputWindow outputDetails={outputDetails} />
            </div>

            {/* Input and Execute Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Input & Execution
              </h3>
              <div className="space-y-4">
                <CustomInput
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                />
                <button
                  onClick={handleCompile}
                  disabled={!code || processing}
                  className={classnames(
                    "w-full min-h-[50px] font-semibold text-white text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-blue-800 rounded-md shadow-lg px-6 py-3 transition-all duration-200 transform hover:scale-[1.02]",
                    !code || processing ? "opacity-50" : ""
                  )}
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Compile and Execute"
                  )}
                </button>
              </div>
            </div>

            {/* Execution Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
              <OutputDetails outputDetails={outputDetails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Landing;
