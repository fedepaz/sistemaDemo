import pdfMakeModule from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { ExportOptions } from "./types";
import { generateFilename } from "./file-utils";
import { EXPORT_CONFIG } from "@/constants/export-config";

// Register fonts - pdfmake default export has addVirtualFileSystem at runtime
// but types don't match, so we use type assertion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfMake = pdfMakeModule as any;
pdfMake.addVirtualFileSystem(pdfFonts);

const LOGO_KEY = "company-logo";

async function fetchLogoAsDataURL(): Promise<string | null> {
  try {
    const response = await fetch(EXPORT_CONFIG.company.logoUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportToPDF<T extends Record<string, unknown>>(
  options: ExportOptions<T>,
): Promise<void> {
  const { data, columns, title, filename } = options;
  const finalFilename = filename ?? generateFilename(title, "pdf");

  const { primaryColor, headerBg, fontSize, margins, pageSize } =
    EXPORT_CONFIG.pdf;

  const logoDataURL = await fetchLogoAsDataURL();

  // A4 width = 595pt, minus left+right margins = available content width
  const contentWidth = 595 - margins.left - margins.right;

  // Build table header
  const tableHeader = columns.map((col) => ({
    text: col.exportHeader,
    style: "tableHeader",
    bold: true,
    color: "#ffffff",
  }));

  // Build table body
  const tableBody = data.map((row, rowIndex) =>
    columns.map((col) => {
      let value: string | number;
      if (col.exportValue) {
        value = col.exportValue(row[col.accessorKey], row);
      } else {
        value = row[col.accessorKey] as string | number;
      }
      return {
        text: String(value ?? ""),
        style: rowIndex % 2 === 0 ? "tableRowEven" : "tableRowOdd",
      };
    }),
  );
  const HEADER_INSET = 15; // tighter than body margins — logo/title sit closer to the edge

  // Letterhead: logo left, company name + tagline right, separated by a rule
  const headerBlock = {
    margin: [HEADER_INSET, 15, HEADER_INSET, 0] as [
      number,
      number,
      number,
      number,
    ],
    stack: [
      {
        columns: [
          logoDataURL
            ? { image: LOGO_KEY, width: 90, fit: [90, 45] as [number, number] }
            : { text: "", width: 90 },
          {
            width: "*",
            stack: [
              {
                text: EXPORT_CONFIG.company.name,
                alignment: "right" as const,
                fontSize: fontSize + 3,
                bold: true,
                color: primaryColor,
              },
              {
                text: EXPORT_CONFIG.company.tagline ?? "Sistema de Gestión",
                alignment: "right" as const,
                fontSize: fontSize - 2,
                color: "#6b7280",
                margin: [0, 2, 0, 0] as [number, number, number, number],
              },
            ],
          },
        ],
        columnGap: 12,
      },
      {
        canvas: [
          {
            type: "line" as const,
            x1: 0,
            y1: 0,
            x2: contentWidth,
            y2: 0,
            lineWidth: 1,
            lineColor: primaryColor,
          },
        ],
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
  };

  const docDefinition = {
    pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    ...(logoDataURL && { images: { [LOGO_KEY]: logoDataURL } }),
    header: headerBlock,
    content: [
      {
        text: title,
        style: "title",
        margin: [0, 0, 0, 4] as [number, number, number, number],
      },
      {
        text: `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        style: "date",
      },
      {
        table: {
          headerRows: 1,
          widths: columns.map((col) => col.pdfWidth),
          body: [tableHeader, ...tableBody],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          fillColor: (rowIndex: number) =>
            rowIndex === 0
              ? primaryColor
              : rowIndex % 2 === 0
                ? headerBg
                : "#ffffff",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
      },
    ],
    styles: {
      title: {
        fontSize: fontSize + 6,
        bold: true,
        color: primaryColor,
      },
      date: {
        fontSize,
        margin: [0, 0, 0, 16] as [number, number, number, number],
        color: "#6b7280",
      },
      tableHeader: {
        fontSize,
        bold: true,
        color: "#ffffff",
      },
      tableRowEven: {
        fontSize,
      },
      tableRowOdd: {
        fontSize,
      },
    },
    footer: ((currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: "center" as const,
      margin: [0, 10, 0, 0],
      fontSize: fontSize - 2,
      color: "#9ca3af",
    })) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.createPdf(docDefinition as any).download(finalFilename);
}
