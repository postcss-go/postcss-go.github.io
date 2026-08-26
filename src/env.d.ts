/// <reference types="astro/client" />

declare module '*?url' {
  const value: string;
  export default value;
}

declare module '*?worker' {
  const WorkerFactory: {
    new (): Worker;
  };
  export default WorkerFactory;
}
