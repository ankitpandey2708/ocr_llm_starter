# Image OCR to Side-by-Side PDF Converter

A Next.js application that allows users to select a folder of images, processes them with Google Gemini API for OCR text extraction, and generates a downloadable PDF with images on the left and extracted text on the right.

## Features

- **Folder Selection**: Select a folder containing image files for processing
- **Image Processing**: Automatic identification and filtering of supported image formats (JPG, JPEG, PNG)
- **OCR Processing**: Text extraction from images using Google Gemini 2.0 Flash API
- **PDF Generation**: Creation of a side-by-side PDF with the original image on the left and extracted text on the right
- **Secure Processing**: Images are processed securely with no persistent storage
- **Error Handling**: Comprehensive error feedback for various failure scenarios

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

You'll need to set up the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key for OCR processing

## Technical Implementation

The application is built using:

- Next.js for the frontend and API routes
- Google Gemini 2.0 Flash API for OCR text extraction
- Server-side PDF generation
- Client-side folder and file selection

## Project Structure

The project follows a standard Next.js application structure with:

- Frontend UI components for folder selection and PDF download
- Backend API endpoints for image processing and PDF generation
- Secure handling of API keys and temporary file storage

## Security Considerations

- API keys are stored securely server-side
- Images are only stored in memory during processing
- All temporary files are deleted after processing

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
