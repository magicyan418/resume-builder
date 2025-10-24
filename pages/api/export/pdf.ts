import type { NextApiRequest, NextApiResponse } from "next";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许 POST 请求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: "Missing HTML content" });
    }

    console.log("开始生成 PDF...");

    // 检查是否在 Vercel 环境
    const isVercel = process.env.VERCEL === "1";
    
    let browser;
    
    if (isVercel) {
      // Vercel 环境使用 chromium
      console.log("使用 Vercel Chromium...");
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ],
        defaultViewport: { width: 1280, height: 720 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // 本地开发环境，尝试使用系统 Chrome
      console.log("使用本地 Chrome...");
      try {
        // 尝试不同的 Chrome 路径
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser'
        ];
        
        let executablePath = null;
        for (const path of possiblePaths) {
          try {
            const fs = require('fs');
            if (fs.existsSync(path)) {
              executablePath = path;
              break;
            }
          } catch (e) {
            // 继续尝试下一个路径
          }
        }
        
        if (!executablePath) {
          throw new Error('未找到 Chrome 浏览器，请安装 Chrome 或使用 Vercel 部署');
        }
        
        console.log("找到 Chrome 路径:", executablePath);
        
        browser = await puppeteer.launch({
          headless: true,
          executablePath,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
          ]
        });
      } catch (error) {
        console.error("本地 Chrome 启动失败:", error);
        return res.status(500).json({ 
          error: "PDF 生成失败", 
          details: "本地开发环境需要安装 Chrome 浏览器，或者部署到 Vercel 进行测试" 
        });
      }
    }

    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewport({ width: 1200, height: 800 });
    
    // 设置页面内容
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

    // 等待字体加载
    await page.evaluateHandle('document.fonts.ready');
    
    // 等待一小段时间确保所有样式都应用
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("页面内容已设置，字体已加载，开始生成 PDF...");

    // 生成 PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5mm",
        right: "5mm",
        bottom: "5mm",
        left: "5mm"
      },
      displayHeaderFooter: false,
    });

    console.log("PDF 生成完成，大小:", pdfBuffer.length, "bytes");

    // 关闭浏览器
    await browser.close();

    // 设置响应头
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    res.setHeader("Cache-Control", "no-cache");
    
    // 返回 PDF 数据
    res.status(200).end(pdfBuffer);

  } catch (error) {
    console.error("PDF 生成错误:", error);
    res.status(500).json({ 
      error: "PDF 生成失败", 
      details: error instanceof Error ? error.message : "未知错误" 
    });
  }
}