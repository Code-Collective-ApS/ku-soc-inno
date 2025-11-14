import type {
  CaseResponse as _CaseResponse,
  CaseSerialized as _CaseSerialized,
} from "~~/server/utils/resources/case";
import type {
  SolutionResponse as _SolutionResponse,
  SolutionSerialized as _SolutionSerialized,
  SolutionPdfSerialized as _SolutionPdfSerialized,
  SolutionAttachmentSerialized as _SolutionAttachmentSerialized,
  SolutionIllustrationSerialized as _SolutionIllustrationSerialized,
  SolutionIllustrationResponse as _SolutionIllustrationResponse,
  SolutionPdfResponse as _SolutionPdfResponse,
  SolutionAttachmentResponse as _SolutionAttachmentResponse,
} from "~~/server/utils/resources/solution";

declare global {
  type CaseResponse = _CaseResponse;
  type CaseSerialized = _CaseSerialized;
  type SolutionResponse = _SolutionResponse;
  type SolutionSerialized = _SolutionSerialized;
  type SolutionPdfSerialized = _SolutionPdfSerialized;
  type SolutionAttachmentSerialized = _SolutionAttachmentSerialized;
  type SolutionIllustrationSerialized = _SolutionIllustrationSerialized;
  type SolutionPdfResponse = _SolutionPdfResponse;
  type SolutionAttachmentResponse = _SolutionAttachmentResponse;
  type SolutionIllustrationResponse = _SolutionIllustrationResponse;
}
