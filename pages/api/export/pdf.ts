import fs from "node:fs"
import type { NextApiRequest, NextApiResponse } from "next"
import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
}

function findLocalChromePath() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const html = req.body?.html
  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "Missing HTML content" })
  }

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    if (process.env.VERCEL === "1") {
      browser = await puppeteer.launch({
        args: [...chromium.args, "--disable-gpu"],
        defaultViewport: { width: 1440, height: 2048 },
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    } else {
      const executablePath = findLocalChromePath()
      if (!executablePath) {
        return res.status(500).json({
          error: "PDF generation failed",
          details: "Local Chrome not found. Install Chrome or verify this API on Vercel.",
        })
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      })
    }

    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 2048, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 })
    await page.evaluate(async () => {
      if ("fonts" in document) {
        await document.fonts.ready
      }
    })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf")
    res.setHeader("Cache-Control", "no-store")
    return res.status(200).send(Buffer.from(pdf))
  } catch (error) {
    return res.status(500).json({
      error: "PDF generation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
