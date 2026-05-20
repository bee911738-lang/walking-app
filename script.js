// =============================================
// 걷기앱 — script.js
// 기능: 카테고리 선택, 미션 뽑기, 완료 처리,
//       점수·레벨 표시, 최근 완료 기록
// =============================================

// ----- 1. 카테고리별 미션 목록 -----
// 각 카테고리마다 해당하는 미션 배열을 담고 있다
const missionData = {
  '전체': [
    "🖼️ 교실 뒤편 게시판까지 천천히 걸어갔다 돌아오기",
    "🦵 제자리에서 가볍게 20걸음 걸으며 무릎 높여주기",
    "📚 다음 교시 수업 준비를 마치고 복도 끝까지 한 바퀴 걷고 오기",
    "🚰 물 마시러 정수기나 매점까지 일부러 조금 돌아가기",
    "👋 친구 자리에 걸어가서 가벼운 인사 나누고 오기",
    "🪜 계단을 한 층만 위아래로 천천히 걸어 다녀오기",
    "👟 발뒤꿈치를 들고 제자리에서 15걸음 걸어보기",
    "🌤️ 창가로 걸어가서 바깥 풍경을 보며 10초 동안 제자리 걷기",
    "🏠 집 방 안에서 거실까지 왕복으로 3번 걸어 다니기",
    "🎵 좋아하는 노래 한 곡이 끝날 때까지 방 안을 자유롭게 걷기",
    "💪 오늘 세운 학습 목표를 마음속으로 되새기며 제자리 걷기 50번",
    "🧍 허리를 곧게 펴고 바른 자세로 교실 한 바퀴 크게 돌기"
  ],
  '교실': [
    "🖼️ 교실 뒤편 게시판까지 천천히 걸어갔다 돌아오기",
    "👋 친구 자리에 걸어가서 가벼운 인사 나누고 오기",
    "🌤️ 창가로 걸어가서 바깥 풍경을 보며 10초 동안 제자리 걷기",
    "🧍 허리를 곧게 펴고 바른 자세로 교실 한 바퀴 크게 돌기"
  ],
  '복도·계단': [
    "📚 다음 교시 수업 준비를 마치고 복도 끝까지 한 바퀴 걷고 오기",
    "🚰 물 마시러 정수기나 매점까지 일부러 조금 돌아가기",
    "🪜 계단을 한 층만 위아래로 천천히 걸어 다녀오기"
  ],
  '집': [
    "🏠 집 방 안에서 거실까지 왕복으로 3번 걸어 다니기",
    "🎵 좋아하는 노래 한 곡이 끝날 때까지 방 안을 자유롭게 걷기"
  ],
  '어디서든': [
    "🦵 제자리에서 가볍게 20걸음 걸으며 무릎 높여주기",
    "👟 발뒤꿈치를 들고 제자리에서 15걸음 걸어보기",
    "💪 오늘 세운 학습 목표를 마음속으로 되새기며 제자리 걷기 50번"
  ]
};

// ----- 2. 레벨 정의 -----
// 누적 점수에 따라 레벨이 달라진다 (10점 단위)
// minScore: 해당 레벨이 되려면 필요한 최소 점수
const levels = [
  { minScore:   0, name: "🌱 씨앗",       next: "30점이면 새싹!" },
  { minScore:  30, name: "🌿 새싹",       next: "70점이면 걷기 입문!" },
  { minScore:  70, name: "🚶 걷기 입문",  next: "120점이면 걷기 고수!" },
  { minScore: 120, name: "🏃 걷기 고수",  next: "200점이면 걷기 챔피언!" },
  { minScore: 200, name: "🏆 걷기 챔피언", next: "최고 레벨 달성! 🎉" }
];

// ----- 3. 상수 -----
const POINTS_PER_MISSION = 10; // 미션 1회 완료 = 10점
const MAX_HISTORY        = 20; // 최근 기록 최대 보관 개수

// ----- 4. HTML 요소 가져오기 -----
const missionCard        = document.getElementById("missionCard");
const missionPlaceholder = document.getElementById("missionPlaceholder");
const missionText        = document.getElementById("missionText");
const missionCountEl     = document.getElementById("missionCount");
const totalScoreEl       = document.getElementById("totalScore");
const levelBadgeEl       = document.getElementById("levelBadge");
const levelNextEl        = document.getElementById("levelNext");
const drawBtn            = document.getElementById("drawBtn");
const doneBtn            = document.getElementById("doneBtn");
const successMsg         = document.getElementById("successMsg");
const historyList        = document.getElementById("historyList");
const historyEmpty       = document.getElementById("historyEmpty");
const toggleArrow        = document.getElementById("toggleArrow");

// ----- 5. 상태 변수 -----
let currentCategory = '전체';  // 현재 선택된 카테고리
let successTimer    = null;    // 완료 메시지 자동 숨김 타이머

// ----- 6. localStorage 관련 함수 -----
// 오늘 날짜 문자열 (예: "2025-05-20")
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// 저장된 데이터를 불러온다. 없으면 기본값 반환
function loadData() {
  const today   = getTodayKey();
  const raw     = localStorage.getItem('walkingApp');
  const data    = raw ? JSON.parse(raw) : {};

  return {
    todayCount: data.date === today ? (data.todayCount || 0) : 0, // 날짜 바뀌면 오늘 횟수 초기화
    totalScore: data.totalScore || 0,
    history:    data.history   || [],   // 최근 완료 기록 배열
    date:       today
  };
}

// 데이터를 localStorage에 저장한다
function saveData(state) {
  localStorage.setItem('walkingApp', JSON.stringify(state));
}

// ----- 7. 카테고리 선택 -----
// 카테고리 칩을 클릭하면 이 함수가 실행된다
function selectCategory(chipEl) {
  // 모든 칩에서 active 클래스 제거
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  // 클릭한 칩에만 active 클래스 추가
  chipEl.classList.add('active');
  // 현재 선택된 카테고리 업데이트
  currentCategory = chipEl.dataset.cat;

  // 카테고리 바뀌면 미션 카드 초기화
  missionText.hidden        = true;
  missionPlaceholder.hidden = false;
  missionCard.classList.remove('has-mission');
  doneBtn.disabled = true;
  hideSuccessMsg();
}

// ----- 8. 미션 뽑기 -----
function drawMission() {
  const pool  = missionData[currentCategory]; // 선택된 카테고리의 미션 배열
  const idx   = Math.floor(Math.random() * pool.length); // 무작위 인덱스
  const picked = pool[idx];

  missionText.textContent   = picked;
  missionText.hidden        = false;
  missionPlaceholder.hidden = true;
  missionCard.classList.add('has-mission');
  doneBtn.disabled = false;
  hideSuccessMsg();
}

// ----- 9. 미션 완료 처리 -----
function completeMission() {
  const completedMission = missionText.textContent; // 방금 완료한 미션 텍스트

  // 9-1. 데이터 불러오기 & 갱신
  const state = loadData();
  state.todayCount += 1;
  state.totalScore += POINTS_PER_MISSION;

  // 9-2. 기록에 추가 (최신 항목이 앞에 오도록)
  const now    = new Date();
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  state.history.unshift({
    text:  completedMission,
    time:  timeStr,
    pts:   POINTS_PER_MISSION
  });
  // 최대 개수 초과 시 오래된 기록 제거
  if (state.history.length > MAX_HISTORY) {
    state.history = state.history.slice(0, MAX_HISTORY);
  }

  // 9-3. 저장
  saveData(state);

  // 9-4. 화면 갱신
  renderScore(state);
  renderHistory(state.history);

  // 9-5. 숫자 팝 애니메이션
  popNumber(missionCountEl);
  popNumber(totalScoreEl);

  // 9-6. 레벨업 체크 & 완료 메시지
  const prevLevel    = getLevelInfo(state.totalScore - POINTS_PER_MISSION);
  const currentLevel = getLevelInfo(state.totalScore);
  if (currentLevel.name !== prevLevel.name) {
    showSuccessMsg(`🎊 레벨 업! ${currentLevel.name} 달성!`);
  } else {
    showSuccessMsg("🎉 잘 했어요! 한 걸음 더 나아갔어요!");
  }

  // 9-7. 카드 초기화
  missionText.hidden        = true;
  missionPlaceholder.hidden = false;
  missionCard.classList.remove('has-mission');
  doneBtn.disabled = true;
}

// ----- 10. 점수 & 레벨 화면에 반영 -----
function renderScore(state) {
  missionCountEl.textContent = state.todayCount;
  totalScoreEl.textContent   = state.totalScore;
  const lv = getLevelInfo(state.totalScore);
  levelBadgeEl.textContent = lv.name;
  levelNextEl.textContent  = lv.next;
}

// ----- 11. 현재 레벨 정보 반환 -----
// 점수에 해당하는 레벨 객체를 찾아 반환한다
function getLevelInfo(score) {
  // 높은 점수 기준부터 내려가며 맞는 레벨을 찾는다
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].minScore) {
      return levels[i];
    }
  }
  return levels[0]; // 기본값
}

// ----- 12. 최근 완료 기록 렌더링 -----
function renderHistory(history) {
  // 기록이 없을 때 안내 문구 표시
  if (history.length === 0) {
    historyList.hidden  = true;
    historyEmpty.hidden = false;
    return;
  }

  historyEmpty.hidden = true;
  historyList.hidden  = false;

  // <li> 목록 생성
  historyList.innerHTML = history.map(item => `
    <li>
      <span class="hist-text">${item.text}</span>
      <span class="hist-meta">
        <span class="hist-time">${item.time}</span>
        <span class="hist-pts">+${item.pts}점</span>
      </span>
    </li>
  `).join('');
}

// ----- 13. 기록 섹션 열기/닫기 토글 -----
function toggleHistory() {
  const isHidden = historyList.hidden && historyEmpty.hidden;

  if (isHidden) {
    // 열기: 기록 유무에 따라 다른 요소 표시
    const state = loadData();
    if (state.history.length === 0) {
      historyEmpty.hidden = false;
    } else {
      historyList.hidden = false;
    }
    toggleArrow.classList.add('open');
  } else {
    // 닫기
    historyList.hidden  = true;
    historyEmpty.hidden = true;
    toggleArrow.classList.remove('open');
  }
}

// ----- 14. 완료 메시지 표시/숨김 -----
function showSuccessMsg(text) {
  if (successTimer) clearTimeout(successTimer);
  successMsg.textContent = text;
  successMsg.hidden = false;
  successTimer = setTimeout(hideSuccessMsg, 2800);
}

function hideSuccessMsg() {
  successMsg.hidden = true;
  if (successTimer) { clearTimeout(successTimer); successTimer = null; }
}

// ----- 15. 숫자 팝 애니메이션 헬퍼 -----
function popNumber(el) {
  el.classList.remove('pop');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('pop'));
  });
  setTimeout(() => el.classList.remove('pop'), 250);
}

// ----- 16. 앱 초기화 (페이지 로드 시 실행) -----
(function init() {
  const state = loadData();
  renderScore(state);
  // 기록 섹션은 닫힌 상태로 시작 (필요할 때 열기)
})();
