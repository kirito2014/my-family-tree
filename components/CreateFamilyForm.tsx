"use client";

import React, { useState } from "react";
import { Camera, ArrowRight, X } from "lucide-react";
import Link from "next/link";

export default function CreateFamilyForm() {
  const [familyName, setFamilyName] = useState("");

  return (
    <div className="min-h-screen bg-[#f7f8f6] dark:bg-[#192210] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
        {/* 背景装饰（模仿 HTML 中的氛围感） */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#80ec13]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#141811] dark:text-white mb-2">创建新家族</h1>
            <p className="text-[#5c6f4b] dark:text-gray-400">开启您的家族传承之旅</p>
          </header>

          <form className="space-y-8">
            {/* 头像上传区域 */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden group-hover:border-[#80ec13] transition-colors">
                  <Camera className="w-10 h-10 text-gray-400 group-hover:text-[#80ec13] transition-colors" />
                </div>
                <button type="button" className="absolute bottom-1 right-1 bg-[#80ec13] p-2 rounded-full shadow-lg text-[#192210] hover:scale-110 transition-transform">
                  <Camera size={18} strokeWidth={3} />
                </button>
              </div>
              <span className="text-sm font-medium text-gray-500">上传家族徽章/合照</span>
            </div>

            {/* 输入区域 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  家族名称
                </label>
                <input
                  type="text"
                  placeholder="例如：陈氏家族"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 focus:ring-[#80ec13]/20 transition-all text-lg"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                className="w-full bg-[#80ec13] hover:bg-[#72d411] active:scale-[0.98] transition-all text-[#192210] font-bold text-lg py-4 rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                完成创建
                <ArrowRight size={20} />
              </button>
              
              <Link 
                href="/" 
                className="text-center text-sm font-medium text-[#5c6f4b] hover:text-[#141811] dark:hover:text-white transition-colors"
              >
                取消并返回
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}