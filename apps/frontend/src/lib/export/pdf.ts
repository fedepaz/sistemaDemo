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
  options: ExportOptions<T>
): Promise<void> {
  const { data, columns, title, filename } = options;
  const finalFilename = filename ?? generateFilename(title, "pdf");

  const { primaryColor, headerBg, fontSize, margins, pageSize } = EXPORT_CONFIG.pdf;

  const logoDataURL = await fetchLogoAsDataURL();

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
    })
  );

  const headerColumns: Array<Record<string, unknown>> = [];

  if (logoDataURL) {
    headerColumns.push({
      image: LOGO_KEY,
      width: 100,
      fit: [100, 50],
    });
  }

  headerColumns.push({
    text: EXPORT_CONFIG.company.name,
    alignment: "right",
    margin: [0, 10, 0, 0],
    fontSize: fontSize + 2,
    bold: true,
    color: primaryColor,
  });

  const docDefinition = {
    pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    ...(logoDataURL && { images: { [LOGO_KEY]: logoDataURL } }),
    header: {
      columns: headerColumns,
      margin: [0, 0, 0, 20],
    },
    content: [
      {
        text: title,
        style: "title",
      },
      {
        text: `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        style: "date",
      },
      {
        table: {
          headerRows: 1,
          widths: columns.map(() => "*"),
          body: [tableHeader, ...tableBody],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? primaryColor : rowIndex % 2 === 0 ? headerBg : "#ffffff",
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
        margin: [0, 0, 0, 10],
        color: primaryColor,
      },
      date: {
        fontSize: fontSize,
        margin: [0, 0, 0, 20],
        color: "#6b7280",
      },
      tableHeader: {
        fontSize: fontSize,
        bold: true,
        color: "#ffffff",
      },
      tableRowEven: {
        fontSize: fontSize,
      },
      tableRowOdd: {
        fontSize: fontSize,
      },
    },
    footer: ((
      currentPage: number,
      pageCount: number,
    ) => ({
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
