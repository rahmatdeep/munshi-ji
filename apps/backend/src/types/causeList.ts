import { Case, CaseHearing, CaseParty, PersonalNote } from "@repo/db";

export interface CauseListCase extends Case {
  parties?: CaseParty[];
  personalNote: PersonalNote | null;
}

export interface CauseListHearing extends CaseHearing {
  isDetailsPending: boolean;
  case: CauseListCase;
}

export interface CauseListResponse {
  causeList: CauseListHearing[];
  startDate: string;
  endDate: string;
}
