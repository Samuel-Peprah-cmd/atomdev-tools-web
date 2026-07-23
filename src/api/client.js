const API_URL = import.meta.env.VITE_HEAVY_API_URL;
const API_KEY = import.meta.env.VITE_ATOMDEV_API_KEY;

export async function submitJob({ tool, file, files, url, options = {} }) {
  const formData = new FormData();
  formData.append("tool", tool);
  formData.append("options", JSON.stringify(options));
  
  // Handle multiple files for PDF merging
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
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to submit job");
  }
  return await response.json();
}

export async function pollJobStatus(jobId, onProgress) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/atomdev-api/jobs/${jobId}`, {
          headers: {
            "X-API-Key": API_KEY,
            "ngrok-skip-browser-warning": "true", // Skips the Ngrok intercept
          },
        });

        if (!response.ok) {
          clearInterval(interval);
          reject(new Error("Job status check failed"));
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