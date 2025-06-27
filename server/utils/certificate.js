// utils/certificate.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (user, course, completionDate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4'
      });

      // Create a unique filename
      const filename = `certificate_${user._id}_${course._id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../temp', filename);

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Certificate design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background gradient
      const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight);
      gradient.stop(0, '#f8fafc');
      gradient.stop(1, '#e2e8f0');
      doc.rect(0, 0, pageWidth, pageHeight).fill(gradient);

      // Border
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
        .lineWidth(3)
        .stroke('#1e40af');

      // Inner border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
        .lineWidth(1)
        .stroke('#3b82f6');

      // Header
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fill('#1e40af')
        .text('CERTIFICADO DE COMPLETACIÓN', pageWidth / 2, 80, {
          align: 'center'
        });

      // Subtitle
      doc.fontSize(18)
        .font('Helvetica')
        .fill('#64748b')
        .text('Este certificado se otorga a', pageWidth / 2, 130, {
          align: 'center'
        });

      // Student name
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fill('#1e293b')
        .text(user.name, pageWidth / 2, 160, {
          align: 'center'
        });

      // Course completion text
      doc.fontSize(16)
        .font('Helvetica')
        .fill('#64748b')
        .text('por completar exitosamente el curso', pageWidth / 2, 200, {
          align: 'center'
        });

      // Course title
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fill('#1e40af')
        .text(course.courseTitle, pageWidth / 2, 230, {
          align: 'center'
        });

      // Completion date
      const formattedDate = new Date(completionDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
        .font('Helvetica')
        .fill('#64748b')
        .text(`Completado el ${formattedDate}`, pageWidth / 2, 270, {
          align: 'center'
        });

      // Certificate ID
      const certificateId = `CERT-${user._id.slice(-6)}-${course._id.slice(-6)}-${Date.now().toString().slice(-6)}`;
      
      doc.fontSize(12)
        .font('Helvetica')
        .fill('#94a3b8')
        .text(`ID: ${certificateId}`, pageWidth / 2, 300, {
          align: 'center'
        });

      // Footer
      doc.fontSize(12)
        .font('Helvetica')
        .fill('#64748b')
        .text('Este certificado es emitido digitalmente y es válido sin firma física.', pageWidth / 2, pageHeight - 80, {
          align: 'center'
        });

      // Course details
      doc.fontSize(10)
        .font('Helvetica')
        .fill('#94a3b8')
        .text(`Categoría: ${course.category}`, 50, pageHeight - 120)
        .text(`Nivel: ${course.courseLevel || 'Intermedio'}`, 50, pageHeight - 100);

      // Instructor info
      if (course.creator && course.creator.name) {
        doc.fontSize(10)
          .font('Helvetica')
          .fill('#94a3b8')
          .text(`Instructor: ${course.creator.name}`, pageWidth - 200, pageHeight - 120);
      }

      // QR Code placeholder (you can add actual QR code generation here)
      doc.rect(pageWidth - 100, pageHeight - 120, 60, 60)
        .lineWidth(1)
        .stroke('#cbd5e1')
        .fontSize(8)
        .font('Helvetica')
        .fill('#94a3b8')
        .text('QR Code', pageWidth - 70, pageHeight - 90, {
          align: 'center'
        });

      doc.end();

      stream.on('finish', () => {
        resolve({
          filepath,
          filename,
          certificateId
        });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

export const deleteCertificateFile = (filepath) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting certificate file:', error);
  }
}; 