export async function getImageData(img: Readonly<Uint8Array>): Promise<ImageData>
{
    const image = new Image();
    const src = URL.createObjectURL(new Blob([ img ], { type: "image/jpeg" }));
    image.src = src;

    return new Promise((resolve, reject) =>
    {
        image.onload = () =>
        {
            const {
                naturalWidth: width,
                naturalHeight: height
            } = image;

            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext("2d");

            if (!ctx) reject("Failed to get 2D context");

            ctx!.scale(1, -1);
            ctx!.drawImage(image, 0, -height);
            resolve(ctx!.getImageData(0, 0, width, height));
        }
        image.onerror = () =>
        {
            URL.revokeObjectURL(src);
            reject("Failed to load image");
        }
    });
}
