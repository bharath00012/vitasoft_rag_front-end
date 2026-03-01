import { useEffect, useState } from "react";
import {
  getRagConfig,
  updateRagConfig,
  resetRagConfig,
} from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const labels: Record<string, string> = {
  chunkSize: "Chunk Size",
  chunkOverlap: "Chunk Overlap",
  semanticThreshold: "Semantic Threshold",
  topK: "Top K Results",
  similarityThreshold: "Similarity Threshold",
};

export default function RagConfigModal({ isOpen, onClose }: Props) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  // Fetch current RAG config
  const fetchConfig = async () => {
    try {
      const res = await getRagConfig();
      setConfig(res.data); // ✅ only the actual config object
    } catch (err) {
      console.error("Failed to fetch config", err);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      [e.target.name]: Number(e.target.value),
    });
  };

  // Update backend with current config
  const handleUpdate = async () => {
    try {
      await updateRagConfig(config);
      alert("✅ Updated Successfully");
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("❌ Update Failed");
    }
  };

  // Load default values into the form without saving
  const handleReset = async () => {
    try {
      const res = await resetRagConfig(); // GET /rag-config/reset
      setConfig(res.data); // ✅ only the default config values
      alert("🔄 Default values loaded. Click Save to apply.");
    } catch (err: any) {
      console.error("Reset failed", err.message);
      alert("❌ Reset Failed");
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-purple-400 text-center">
          ⚙ RAG Configuration Settings
        </h2>

        {Object.keys(config).map((key) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {labels[key] || key}
            </label>

            <input
              type="number"
              name={key}
              value={config[key]}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Reset
          </button>

          <div>
            <button
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-500 rounded hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}