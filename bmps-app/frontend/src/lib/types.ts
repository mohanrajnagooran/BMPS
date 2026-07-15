export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea" | "lookup";
  options?: string[];
  required?: boolean;
  lookupEndpoint?: string;
  lookupLabel?: string;
};
