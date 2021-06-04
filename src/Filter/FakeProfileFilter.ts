import debug from "debug"
import { mean, some } from "lodash"

import {IProfile} from "../interfaces"
import {IProfileFilter} from "./interfaces"


const NAME = 'Fake'
const log = debug('Filter').extend(NAME)
const SCORE_THRESHOLD = 0.5

export class FakeProfileFilter implements IProfileFilter {
  name: string = NAME

  check(profile: IProfile): boolean {
    const followersCountScore = FakeProfileFilter.followersCountScore(profile)
    const followingCountScore = FakeProfileFilter.followingCountScore(profile)
    const followersFollowingRatioScore = FakeProfileFilter.followersFollowingRatioScore(profile)
    const postsCountScore = FakeProfileFilter.postsCountScore(profile)
    const hasClipsScore = FakeProfileFilter.hasClipsScore(profile)
    const hasChannelScore = FakeProfileFilter.hasChannelScore(profile)
    const highlightReelCountScore = FakeProfileFilter.highlightReelCountScore(profile)
    const igtvCountScore = FakeProfileFilter.igtvCountScore(profile)
    const postsAnalysisScore = FakeProfileFilter.postsAnalysisScore(profile)

    log(`[${profile.full_name} (${profile.username})]`)
    log(`followersCountScore: ${followersCountScore.toFixed(2)}`)
    log(`followingCountScore: ${followingCountScore.toFixed(2)}`)
    log(`followersFollowingRatioScore: ${followersFollowingRatioScore.toFixed(2)}`)
    log(`postsCountScore: ${postsCountScore.toFixed(2)}`)
    log(`hasClipsScore: ${hasClipsScore.toFixed(2)}`)
    log(`hasChannelScore: ${hasChannelScore.toFixed(2)}`)
    log(`highlightReelCountScore: ${highlightReelCountScore.toFixed(2)}`)
    log(`igtvCountScore: ${igtvCountScore.toFixed(2)}`)
    log(`postsAnalysisScore: ${postsAnalysisScore.toFixed(2)}`)

    const score = mean([
      followersCountScore,
      followingCountScore,
      followersFollowingRatioScore,
      postsCountScore,
      hasClipsScore,
      hasChannelScore,
      highlightReelCountScore,
      igtvCountScore,
      postsAnalysisScore,
    ])

    if (score >= SCORE_THRESHOLD) {
      log(`${profile.full_name} (${profile.username}) PASS (${score.toFixed(2)})`)

      return true
    } else {
      log(`${profile.full_name} (${profile.username}) FAIL (${score.toFixed(2)})`)

      return false
    }
  }

  private static followersCountScore(profile: IProfile): number {
    const THRESHOLD_MIN = 100
    const THRESHOLD_MAX = 2000

    if (profile.followers_count < THRESHOLD_MIN) return (profile.followers_count / THRESHOLD_MIN) * 0.5

    const followersCount = Math.min(profile.followers_count, THRESHOLD_MAX)

    return ((followersCount / THRESHOLD_MAX) * 0.5) + 0.5
  }

  private static followingCountScore(profile: IProfile): number {
    const THRESHOLD_MAX = 3000

    const followingCount = Math.min(profile.following_count, THRESHOLD_MAX)

    return (THRESHOLD_MAX - followingCount) / THRESHOLD_MAX
  }

  private static followersFollowingRatioScore(profile: IProfile): number {
    if (profile.following_count === 0) return 1
    const ratio = Math.min(profile.followers_count / profile.following_count, 2)

    if (ratio < 1) {
      return ratio * 0.5
    } else {
      return ((ratio - 1) * 0.5) + 0.5
    }
  }

  private static postsCountScore(profile: IProfile): number {
    const THRESHOLD_MIN = 4
    const THRESHOLD_MAX = 100

    const postCount = Math.min(THRESHOLD_MAX, profile.post_count)

    if (postCount < THRESHOLD_MIN) return 0

    if (postCount <= 10) {
      return (postCount / 10) * 0.5
    }

    return ((postCount / THRESHOLD_MAX) * 0.5) + 0.5
  }

  private static hasClipsScore(profile: IProfile): number {
    return profile.has_clips ? 1.0 : 0.5
  }

  private static hasChannelScore(profile: IProfile): number {
    return profile.has_channel ? 1.0 : 0.5
  }

  private static highlightReelCountScore(profile: IProfile): number {
    return profile.highlight_reel_count > 0 ? 1.0 : 0.5
  }

  private static igtvCountScore(profile: IProfile): number {
    return profile.igtv_count > 0 ? 1.0 : 0.5
  }

  private static postsAnalysisScore(profile: IProfile): number {
    let score = 0.5

    if (some(profile.posts, (post) => post.is_video)) {
      log(`Post is video +0.1`)
      score += 0.1
    }

    if (some(profile.posts, (post) => post.has_location)) {
      log(`Post with location +0.1`)
      score += 0.1
    }

    const sevenDaysAgo = Math.floor(new Date().getTime() / 1000) - 7 * 24 * 60 * 60
    if (some(profile.posts, (post) => post.timestamp > sevenDaysAgo)) {
      log(`Post in last 7 days +0.1`)
      score += 0.1
    }

    if (some(profile.posts, (post) => post.comment_count > 0)) {
      log(`Post with comment +0.1`)
      score += 0.1
    }

    if (some(profile.posts, (post) => post.accessibility_caption && (post.accessibility_caption.includes('person') || post.accessibility_caption.includes('people')))) {
      log(`Post with people +0.1`)
      score += 0.1
    }

    return score
  }
}
