declare module 'pdfjs-dist' {
    export const GlobalWorkerOptions: { workerSrc: string };
    export function getDocument(src: any): { promise: Promise<any> };
    export interface PDFPageProxy {
        getViewport(opts: { scale: number }): { width: number; height: number };
        render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
    }
    export interface PDFDocumentProxy {
        numPages: number;
        getPage(num: number): Promise<PDFPageProxy>;
    }
    export type PDFDocumentLoadingTask = any;
    export type PDFDocumentLoadingTaskParameters = any;
}
