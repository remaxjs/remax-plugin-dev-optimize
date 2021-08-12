export const extensions = ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'];

export const targetExtensions = (target) => {
  let ext = extensions.map(ext => `.${target}${ext}`);
  if (target !== 'web') {
    ext = ext.concat(extensions.map(ext => `.mini${ext}`));
  }
  return ext.concat(extensions);
};

