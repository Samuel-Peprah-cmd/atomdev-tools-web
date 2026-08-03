const API_URL = import.meta.env.VITE_HEAVY_API_URL;
const API_KEY = import.meta.env.VITE_ATOMDEV_API_KEY;

export async function submitJob({ tool, file, files, url, options = {}, token }) {
  const formData = new FormData();
  formData.append("tool", tool);
  formData.append("options", JSON.stringify(options));

  if (files && files.length > 0) {
    files.forEach(f => formData.append("files", f));
  } else if (file) {
    formData.append("file", file);
  }
  if (url) formData.append("url", url);

  const response = await fetch(`${API_URL}/atomdev-api/jobs`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Authorization": `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Failed to submit job";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // CACHING THE HTML CRASH: If the backend returns HTML (500 Error), we intercept it here.
      errorMessage = `Server Error (${response.status}): The backend crashed or is offline.`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function pollJobStatus(jobId, token, onProgress) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      try {
        attempts++;
        const response = await fetch(`${API_URL}/atomdev-api/jobs/${jobId}`, {
          headers: {
            "X-API-Key": API_KEY,
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          // DELAY FIX: Give the backend up to 10 seconds to write the JSON file before giving up on a 404
          if (response.status === 404 && attempts < 4) return;
          
          clearInterval(interval);
          reject(new Error("Job status check failed or timed out."));
          return;
        }

        const data = await response.json();
        onProgress(data);

        if (data.status === "done") {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === "failed") {
          clearInterval(interval);
          reject(new Error(data.error || "Job execution failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 2500);
  });
}