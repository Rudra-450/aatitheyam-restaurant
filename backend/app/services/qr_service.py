import io
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from app.core.config import settings

class QRService:
    @staticmethod
    def generate_menu_qr(
        target_url: str | None = None,
        box_size: int = 15,
        border: int = 4
    ) -> bytes:
        """
        Generates a high-resolution, print-ready QR code targeting the public digital menu URL.
        """
        url = target_url or settings.PUBLIC_MENU_BASE_URL
        
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=box_size,
            border=border,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(
            fill_color="#0b0c10",
            back_color="#ffffff"
        )

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer.getvalue()

qr_service = QRService()
