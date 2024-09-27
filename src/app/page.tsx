"use client";

import Menu from "@/components/menu";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, RefreshCw } from "lucide-react";

interface FoodMenu {
  name: string;
  restaurant: string;
  sections: {
    name: string;
    items: {
      name: string;
      price: string;
      image: string;
    }[];
  }[];
  contact: {
    phone: string;
    address: string;
  };
}

const MenuGenerator = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [menuData, setMenuData] = useState<FoodMenu | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.substr(0, 5) === "image") {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setPreview(null);
      setError("Please select a valid image file.");
    }
  };

  const processMenu = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("menuImage", file);

    const response = await fetch("/api/process-menu", {
      method: "POST",
      body: formData,
    });

    const data: FoodMenu = await response.json();
    setMenuData(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-500">
          AI Menu Generator
        </h1>
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
          <div className="mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden"
            >
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-orange-500 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center"
              >
                <Upload className="mr-2" />
                Upload Menu Image
              </button>
            </motion.div>
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={processMenu}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center"
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <RefreshCw className="mr-2 animate-spin" />
            ) : (
              <ImageIcon className="mr-2" />
            )}
            {isLoading ? "Processing..." : "Generate Menu"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <Menu initialMenuData={menuData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuGenerator;
