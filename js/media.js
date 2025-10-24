
// media.js: photo capture and compression (client-side)
(function(){
  async function compressImage(file, maxW=1280, quality=0.8){
    const img = new Image();
    const url = URL.createObjectURL(file);
    await new Promise(res=>{ img.onload=res; img.src=url; });
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxW / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width*scale);
    canvas.height = Math.round(img.height*scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(res=>canvas.toBlob(res, 'image/jpeg', quality));
    URL.revokeObjectURL(url);
    return new File([blob], file.name.replace(/\.\w+$/i, '.jpg'), {type:'image/jpeg'});
  }

  function attachPhotoFlow(){
    const btn = document.getElementById('btn-add-photo');
    if (!btn) return;
    btn.addEventListener('click', async ()=>{
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
      input.onchange = async ()=>{
        const file = input.files[0];
        if (!file) return;
        const compressed = await compressImage(file);
        if (window.CC_Checkins && window.CC_Checkins.uploadPhoto){
          window.CC_Checkins.uploadPhoto(compressed);
        }
      };
      input.click();
    });
  }

  window.addEventListener('DOMContentLoaded', attachPhotoFlow);
  window.CC_Media = { compressImage };
})();
