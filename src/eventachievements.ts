export default class EventAchievements {
  private _achievement_list: { [key: number]: { [key: number]: any[] } } = {};
  private _achievement_list_byid: { [key: number]: any } = {};
  private _quest_data: any = {};

  LoadAchievementsForEvent(data: any) {
    const eventid = data.eventid;
    const achievements = data.achievements;
    const seasons = data.seasons;

    for (const season of seasons) {
      if (this._achievement_list[eventid] == null) {
        this._achievement_list[eventid] = {};
      }
      this._achievement_list[eventid][season] = achievements;
    }

    if (
      eventid === WORLD_FESTIVAL_EVENT &&
      table.contains(seasons, GetFestivalEventSeasons(eventid))
    ) {
      this._achievement_list_byid = {};
      for (const cat of achievements) {
        for (const achievement of cat.data) {
          this._achievement_list_byid[achievement.achievementid] = achievement;
        }
      }

      if (data.impl != null) {
        data.impl.AddTestFunctions(this._achievement_list_byid);
      }
    }
  }

  GetActiveAchievementsIdList() {
    return this._achievement_list_byid;
  }

  GetAchievementsCategoryList(eventid: number, season: number) {
    return this._achievement_list[eventid][season];
  }

  FindAchievementData(eventid: number, season: number, achievementid: number) {
    for (const v of Object.values(this._achievement_list[eventid][season])) {
      for (const achievement of v.data) {
        if (achievement.achievementid === achievementid) {
          return achievement;
        }
      }
    }
    return null;
  }

  IsAchievementUnlocked(
    eventid: number,
    season: number,
    achievementid: number
  ) {
    return TheInventory.IsAchievementUnlocked(
      GetFestivalEventServerName(eventid, season),
      achievementid
    );
  }

  GetNumAchievementsUnlocked(eventid: number, season: number) {
    let total = 0;
    let unlocked = 0;
    for (const cat of this._achievement_list[eventid][season]) {
      for (const achievement of cat.data) {
        if (
          EventAchievements.IsAchievementUnlocked(
            eventid,
            season,
            achievement.achievementid
          )
        ) {
          unlocked++;
        }
        total++;
      }
    }
    return [unlocked, total];
  }

  SetAchievementTempUnlocked(achievementid: number) {
    const event_server_name = GetActiveFestivalEventServerName();
    TheInventory.SetAchievementTempUnlocked(event_server_name, achievementid);
    console.log(
      `Temp Unlocking Achievement ${achievementid} - ${
        TheInventory.IsAchievementUnlocked(event_server_name, achievementid)
          ? "success"
          : "failed"
      }`
    );
  }

  IsActiveAchievement(achievementid: number) {
    const event_id = WORLD_FESTIVAL_EVENT;
    return (
      this._achievement_list_byid != null &&
      this._achievement_list_byid[achievementid] != null
    );
  }

  GetAllUnlockedAchievements(eventid: number, season: number) {
    return (
      TheInventory.GetAllUnlockedAchievements(
        GetFestivalEventServerName(eventid, season)
      ) || {}
    );
  }

  SetActiveQuests(quest_data: any) {
    this._quest_data = quest_data;
  }

  BuildFullQuestName(quest_id: number, character: string) {
    let post_fix =
      "-" +
      string.format("-%03d", this._quest_data.version) +
      string.format(
        "-%03d",
        this._achievement_list_byid[quest_id].daily
          ? this._quest_data.event_day
          : this._quest_data.quest_day
      );

    if (
      character != null &&
      (quest_id === this._quest_data.special1.quest ||
        quest_id === this._quest_data.special2.quest)
    ) {
      post_fix = post_fix + "-" + character;
    }

    return quest_id + post_fix;
  }

  ParseFullQuestName(quest_name: string) {
    const data = quest_name.split("-");
    const ret = {
      quest_id: data[1],
      version: parseInt(data[2]),
      day: parseInt(data[3]),
      character: data[4],
      daily:
        this._achievement_list_byid[data[1]] != null &&
        this._achievement_list_byid[data[1]].daily != null
          ? this._achievement_list_byid[data[1]].daily
          : null,
    };

    if (ret.version == null) {
      if (data.length === 4) {
        ret.day = parseInt(data[4]);
        ret.version = parseInt(data[3]) || 0;
        ret.character = data[2];
      } else {
        ret.day = parseInt(data[3]);
        ret.version = parseInt(data[2]) || 0;
      }
    }

    return ret;
  }
}
