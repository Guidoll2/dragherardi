// models/Publication.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type PublicationStatus = "draft" | "published" | "archived";

export type PaperType =
  | "original-research"
  | "review"
  | "case-study"
  | "meta-analysis"
  | "short-communication"
  | "general";

export type SectionType =
  | "abstract"
  | "introduction"
  | "methods"
  | "results"
  | "discussion"
  | "conclusion"
  | "acknowledgments"
  | "custom";

export interface IStructuredAbstract {
  objective: string;
  methods: string;
  results: string;
  conclusions: string;
}

export interface IPaperSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  wordLimit?: number;
}

export interface IFigure {
  id: string;
  type: "figure" | "table";
  number: number;
  caption: string;
  imageUrl?: string;
  tableHtml?: string;
  sectionId?: string;
}

export interface IReference {
  id: string;
  order: number;
  doi?: string;
  title: string;
  authors: string;
  journal?: string;
  year: string;
  volume?: string;
  pages?: string;
  url?: string;
}

export interface IPublication extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  content: string; // Legacy content field / combined content
  paperType: PaperType;
  sections: IPaperSection[];
  structuredAbstract: IStructuredAbstract;
  figures: IFigure[];
  references: IReference[];
  meshKeywords: string[];
  authorId: string;
  authorName: string;
  authorEmail: string;
  coAuthors: {
    id: string;
    name: string;
    email: string;
  }[];
  tags: string[];
  status: PublicationStatus;
  isPubliclyVisible: boolean;
  publicSlug?: string;
  readCount: number;
  lastAutoSave?: Date;
  versionHistory: {
    savedAt: Date;
    label?: string;
    sections: IPaperSection[];
  }[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const PaperSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["abstract", "introduction", "methods", "results", "discussion", "conclusion", "acknowledgments", "custom"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    order: { type: Number, required: true },
    wordLimit: { type: Number },
  },
  { _id: false }
);

const StructuredAbstractSchema = new Schema(
  {
    objective: { type: String, default: "" },
    methods: { type: String, default: "" },
    results: { type: String, default: "" },
    conclusions: { type: String, default: "" },
  },
  { _id: false }
);

const FigureSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["figure", "table"], required: true },
    number: { type: Number, required: true },
    caption: { type: String, default: "" },
    imageUrl: { type: String },
    tableHtml: { type: String },
    sectionId: { type: String },
  },
  { _id: false }
);

const ReferenceSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    doi: { type: String },
    title: { type: String, required: true },
    authors: { type: String, required: true },
    journal: { type: String },
    year: { type: String, required: true },
    volume: { type: String },
    pages: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const VersionHistorySchema = new Schema(
  {
    savedAt: { type: Date, default: Date.now },
    label: { type: String },
    sections: [PaperSectionSchema],
  },
  { _id: false }
);

const PublicationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      default: "",
    },
    paperType: {
      type: String,
      enum: ["original-research", "review", "case-study", "meta-analysis", "short-communication", "general"],
      default: "general",
    },
    sections: {
      type: [PaperSectionSchema],
      default: [],
    },
    structuredAbstract: {
      type: StructuredAbstractSchema,
      default: () => ({ objective: "", methods: "", results: "", conclusions: "" }),
    },
    figures: {
      type: [FigureSchema],
      default: [],
    },
    references: {
      type: [ReferenceSchema],
      default: [],
    },
    meshKeywords: {
      type: [String],
      default: [],
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    coAuthors: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isPubliclyVisible: {
      type: Boolean,
      default: false,
    },
    publicSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    lastAutoSave: {
      type: Date,
    },
    versionHistory: {
      type: [VersionHistorySchema],
      default: [],
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas optimizadas
PublicationSchema.index({ title: "text", summary: "text", content: "text" });
PublicationSchema.index({ authorId: 1, status: 1 });
PublicationSchema.index({ tags: 1, status: 1 });

const Publication: Model<IPublication> =
  mongoose.models.Publication ||
  mongoose.model<IPublication>("Publication", PublicationSchema);

export default Publication;
