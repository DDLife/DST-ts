/**
 * Vote utility functions for use in defining user vote commands
 */

export interface VoteResults {
  /** Total abstains after time runs out */
  total_not_voted: number;
  /** Total votes after everyone votes or time runs out*/
  total_voted: number;
  /** Total voters (includes voted and abstained) */
  total: number;
  /**
   *   options[1]       : 'Yes' vote count
   *
   *   options[2]       : 'No' vote count
   */
  options: [number, number];
}

interface VoteParams {
  /** The name of the vote command */
  command: string;
  /** The name of the player who initiated the vote */
  caller: string;
  /** The ID of the player being voted on */
  targetid: string;
}

/*

 */

/**
 * User commands 'voteresultfn' property:
 *
 * Required for tallying vote counts to determine the winning result
 *
 * NOTE: If there is a target user who does not get to vote,
 *       that user will not be included in any of the counts
 *
 * NOTE: Do not need to validate min player count again
 *
 * @param params - The parameters of the vote command
 * @param voteresults - The results of the vote
 * @returns An array containing the winning option and its vote count, or undefined if there is no winner
 */
function DefaultUnanimousVote(
  params: VoteParams,
  voteresults: VoteResults
): [number, number | undefined] | undefined {
  let result: number | undefined, count: number | undefined;
  for (let i = 0; i < voteresults.options.length; i++) {
    const v = voteresults.options[i];
    if (v > 0) {
      if (result !== undefined) {
        return; // Not unanimous
      }
      result = i;
      count = v;
    }
  }
  return result !== undefined ? [result, count] : undefined;
}

/**
 * Required for tallying vote counts to determine the winning result
 * @param params - The parameters of the vote command
 * @param voteresults - The results of the vote
 * @returns An array containing the winning option and its vote count, or undefined if there is no winner
 */
function DefaultMajorityVote(
  params: VoteParams,
  voteresults: VoteResults
): [number, number] | undefined {
  let result: number | undefined,
    count = 0;
  for (let i = 0; i < voteresults.options.length; i++) {
    const v = voteresults.options[i];
    if (v > count) {
      result = i;
      count = v;
    } else if (v === count) {
      result = undefined;
    }
  }
  return result !== undefined ? [result, count] : undefined;
}

/**
 * Required for tallying vote counts to determine the winning result
 * @param params - The parameters of the vote command
 * @param voteresults - The results of the vote
 * @returns An array containing the winning option and its vote count, or undefined if there is no winner
 */
function YesNoUnanimousVote(
  params: VoteParams,
  voteresults: VoteResults
): [number, number] | undefined {
  const [result, count] = DefaultUnanimousVote(params, voteresults) ?? [];
  if (result === 1) {
    // Only return 'Yes' results
    return [result, count];
  }
}

/**
 * Required for tallying vote counts to determine the winning result
 * @param params - The parameters of the vote command
 * @param voteresults - The results of the vote
 * @returns An array containing the winning option and its vote count, or undefined if there is no winner
 */
function YesNoMajorityVote(
  params: VoteParams,
  voteresults: VoteResults
): [number, number] | undefined {
  const [result, count] = DefaultMajorityVote(params, voteresults) ?? [];
  if (result === 1) {
    // Only return 'Yes' results
    return [result, count];
  }
}

// User commands 'votecanstartfn' property:
// Optional custom checks for whether a vote can start or not
// NOTE: Do not need to validate min player count again
// NOTE: Logic MUST be VALID ON CLIENTS!
// e.g. For votes that you don't want to start at night:
// function cannotStartVoteAtNight(command: string, caller: string, targetid: string): [boolean, string | null] {
//   if (TheWorld.state.isnight) { // this check is valid on clients
//     return [false, "NIGHT"]; // custom fail reason, used for UI tooltip
//   }
//   return [true, null];
// }
// Optional tooltip string for the fail reason:
// STRINGS.UI.PLAYERSTATUSSCREEN.VOTECANNOTSTART["NIGHT"] = "Can't start a vote at night."

/**
 * Optional custom checks for whether a vote can start or not
 * @param command - The name of the vote command
 * @param caller - The name of the player who initiated the vote
 * @param targetid - The ID of the player being voted on
 * @returns A boolean indicating whether the vote can start, and an optional string containing the reason why it cannot start
 */
function DefaultCanStartVote(
  command: string,
  caller: string,
  targetid: string
): [boolean, string | null] {
  return [true, null];
}

export default {
  // voteresultfn:
  DefaultUnanimousVote,
  DefaultMajorityVote,
  YesNoUnanimousVote,
  YesNoMajorityVote,

  // votecanstartfn:
  DefaultCanStartVote,
};
