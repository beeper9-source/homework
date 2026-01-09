// 과제 목록
const assignments = [
    '반응계적 스케일링',
    '세고비아 C 메이저',
    '깔레바로 아르페지오',
    '카르카시 경음 연습',
    '깔레바로의 리가도 트레이닝',
    '시프팅 반응계 트레이닝',
    '옥타브 반응계 트레이닝'
];

// LocalStorage 키
const STORAGE_KEY = 'guitar_homework_data';

// 현재 선택된 날짜 (기본값: 오늘)
let currentDate = new Date().toISOString().split('T')[0];

// 데이터 구조: { [date]: { [assignmentIndex]: { completed: boolean, memo: string } } }
let homeworkData = {};

// 초기화
function init() {
    loadData();
    setupDateInput();
    setupEventListeners();
    renderAssignments();
    updateStats();
    renderHistory();
}

// 데이터 로드
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            homeworkData = JSON.parse(saved);
        } catch (e) {
            console.error('데이터 로드 실패:', e);
            homeworkData = {};
        }
    }
}

// 데이터 저장
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(homeworkData));
    } catch (e) {
        console.error('데이터 저장 실패:', e);
        alert('데이터 저장에 실패했습니다. 저장 공간이 부족할 수 있습니다.');
    }
}

// 날짜 입력 설정
function setupDateInput() {
    const dateInput = document.getElementById('date-input');
    dateInput.value = currentDate;
    dateInput.max = new Date().toISOString().split('T')[0]; // 오늘 이후 날짜 선택 불가
    
    dateInput.addEventListener('change', (e) => {
        currentDate = e.target.value;
        renderAssignments();
        updateStats();
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 전체 기록 보기
    document.getElementById('show-all-history').addEventListener('click', () => {
        renderHistory(true);
    });

    // 데이터 내보내기
    document.getElementById('export-data').addEventListener('click', exportData);

    // 데이터 가져오기
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', importData);
}

// 과제 목록 렌더링
function renderAssignments() {
    const container = document.getElementById('assignments-list');
    container.innerHTML = '';

    if (!homeworkData[currentDate]) {
        homeworkData[currentDate] = {};
    }

    assignments.forEach((assignment, index) => {
        const assignmentData = homeworkData[currentDate][index] || { completed: false, memo: '' };
        
        const card = document.createElement('div');
        card.className = `assignment-card ${assignmentData.completed ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="assignment-header">
                <div class="assignment-title">${assignment}</div>
                <div class="assignment-number">${index + 1}</div>
            </div>
            <div class="assignment-body">
                <div class="checkbox-group">
                    <input 
                        type="checkbox" 
                        id="assignment-${index}" 
                        ${assignmentData.completed ? 'checked' : ''}
                        data-index="${index}"
                    >
                    <label for="assignment-${index}">완료</label>
                </div>
                <div class="memo-section">
                    <label for="memo-${index}">메모:</label>
                    <textarea 
                        id="memo-${index}" 
                        placeholder="연습 내용이나 느낀 점을 기록하세요..."
                        data-index="${index}"
                    >${assignmentData.memo || ''}</textarea>
                </div>
            </div>
        `;

        // 체크박스 이벤트
        const checkbox = card.querySelector(`#assignment-${index}`);
        checkbox.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            if (!homeworkData[currentDate][idx]) {
                homeworkData[currentDate][idx] = { completed: false, memo: '' };
            }
            homeworkData[currentDate][idx].completed = e.target.checked;
            saveData();
            renderAssignments();
            updateStats();
            renderHistory();
        });

        // 메모 이벤트
        const textarea = card.querySelector(`#memo-${index}`);
        textarea.addEventListener('blur', (e) => {
            const idx = parseInt(e.target.dataset.index);
            if (!homeworkData[currentDate][idx]) {
                homeworkData[currentDate][idx] = { completed: false, memo: '' };
            }
            homeworkData[currentDate][idx].memo = e.target.value;
            saveData();
            renderHistory();
        });

        container.appendChild(card);
    });
}

// 통계 업데이트
function updateStats() {
    if (!homeworkData[currentDate]) {
        homeworkData[currentDate] = {};
    }

    let completedCount = 0;
    assignments.forEach((_, index) => {
        if (homeworkData[currentDate][index]?.completed) {
            completedCount++;
        }
    });

    const totalCount = assignments.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('progress-percent').textContent = `${progressPercent}%`;
}

// 기록 렌더링
function renderHistory(showAll = false) {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    const dates = Object.keys(homeworkData).sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>아직 기록이 없습니다.</p>
            </div>
        `;
        return;
    }

    const datesToShow = showAll ? dates : dates.slice(0, 10);

    datesToShow.forEach(date => {
        const dayData = homeworkData[date];
        const completedAssignments = [];
        
        assignments.forEach((assignment, index) => {
            if (dayData[index]?.completed) {
                completedAssignments.push(assignment);
            }
        });

        if (completedAssignments.length > 0 || Object.keys(dayData).some(idx => dayData[idx]?.memo)) {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });

            item.innerHTML = `
                <div class="history-date">${dateFormatted}</div>
                <div class="history-assignments">
                    완료: ${completedAssignments.length}개 / ${assignments.length}개
                </div>
            `;

            container.appendChild(item);
        }
    });

    if (!showAll && dates.length > 10) {
        const moreItem = document.createElement('div');
        moreItem.className = 'history-item';
        moreItem.style.textAlign = 'center';
        moreItem.style.color = '#667eea';
        moreItem.style.cursor = 'pointer';
        moreItem.textContent = `... 더 보기 (총 ${dates.length}일)`;
        moreItem.addEventListener('click', () => renderHistory(true));
        container.appendChild(moreItem);
    }
}

// 데이터 내보내기
function exportData() {
    const dataStr = JSON.stringify(homeworkData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guitar_homework_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// 데이터 가져오기
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm('기존 데이터를 가져온 데이터로 덮어쓰시겠습니까?')) {
                homeworkData = imported;
                saveData();
                renderAssignments();
                updateStats();
                renderHistory();
                alert('데이터를 성공적으로 가져왔습니다.');
            }
        } catch (err) {
            alert('파일 형식이 올바르지 않습니다.');
            console.error('데이터 가져오기 실패:', err);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // 같은 파일 다시 선택 가능하도록
}

// 앱 초기화
init();
