const date = new Date();
const str = date.toISOString();

console.log(new Date(str.split('.').shift()));
