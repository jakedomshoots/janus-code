import QRCodeBrowser from 'qrcode/lib/browser'

export async function renderMobileQrDataUrl(text: string): Promise<string> {
  return QRCodeBrowser.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 232
  })
}
