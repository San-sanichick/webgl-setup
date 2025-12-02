export async function getImageData(img: Readonly<Uint8Array>): Promise<HTMLImageElement>
{
    const image = new Image();
    const src = URL.createObjectURL(new Blob([ img ], { type: "image/jpeg" }));
    image.src = src;

    return new Promise((resolve, reject) =>
    {
        image.onload = () =>
        {
            resolve(image);
        }

        image.onerror = () =>
        {
            URL.revokeObjectURL(src);
            reject("Failed to load image");
        }
    });
}
