const serverUrl = import.meta.env.VITE_SERVER_URL || "https://convia-backend-c8i9.onrender.com";

export default serverUrl.replace(/\/+$/, "");