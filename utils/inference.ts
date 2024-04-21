// See: https://medium.com/@islizeqiang/unlocking-the-magic-of-infer-in-typescript-571d4082bc80#:~:text=In%20this%20definition%2C%20T%20is,and%20assigns%20it%20to%20R%20.
export type PromiseType<T extends Promise<any>> =
  T extends Promise<infer U> ? U : never;

export type UnboxArray<T extends any[]> = T extends (infer U)[] ? U : never;
