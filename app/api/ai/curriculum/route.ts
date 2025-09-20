import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, duration, level, description } = await request.json()

    if (!topic || !duration || !level) {
      return NextResponse.json(
        { error: '필수 정보를 입력해주세요' },
        { status: 400 }
      )
    }

    // OpenAI API 키가 설정되지 않은 경우 모의 데이터 반환
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not set, returning mock data')
      const mockCurriculum = generateMockCurriculum(topic, duration, level)
      return NextResponse.json(
        { curriculum: mockCurriculum },
        { status: 200 }
      )
    }

    // GPT-4를 사용하여 커리큘럼 생성
    const prompt = `
다음 정보를 바탕으로 세미나 커리큘럼을 생성해주세요:
- 주제: ${topic}
- 기간: ${duration}일
- 난이도: ${level === 'beginner' ? '입문' : level === 'intermediate' ? '중급' : '고급'}
- 설명: ${description || ''}

다음 JSON 형식으로 응답해주세요:
{
  "overview": "커리큘럼 개요 (1-2문장)",
  "objectives": ["학습 목표 1", "학습 목표 2", "학습 목표 3", "학습 목표 4"],
  "targetAudience": "대상 수강생",
  "sessions": [
    {
      "week": 1,
      "title": "세션 제목",
      "description": "세션 설명",
      "objectives": ["세부 목표 1", "세부 목표 2", "세부 목표 3"],
      "materials": ["학습 자료 1", "학습 자료 2", "학습 자료 3"],
      "assignment": "과제 내용"
    }
  ],
  "requirements": ["선수 지식 1", "선수 지식 2", "선수 지식 3"],
  "evaluation": {
    "attendance": 30,
    "assignments": 30,
    "project": 30,
    "participation": 10
  }
}

주차 수는 ${Math.ceil(duration / 7)}주로 구성하고, 각 주차별로 구체적이고 실용적인 내용을 포함해주세요.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "당신은 전문적인 교육 커리큘럼을 설계하는 교육 전문가입니다. 체계적이고 실용적인 커리큘럼을 JSON 형식으로 생성해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const curriculumText = completion.choices[0].message.content
    
    if (!curriculumText) {
      throw new Error('GPT 응답이 비어있습니다')
    }

    let curriculum
    try {
      curriculum = JSON.parse(curriculumText)
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)
      // 파싱 실패 시 모의 데이터 반환
      curriculum = generateMockCurriculum(topic, duration, level)
    }

    return NextResponse.json(
      { curriculum },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('AI curriculum generation error:', error)
    
    // OpenAI API 오류 시 상세 메시지
    if (error.response) {
      console.error('OpenAI API Error:', error.response.data)
      return NextResponse.json(
        { error: `OpenAI API 오류: ${error.response.data.error.message}` },
        { status: error.response.status }
      )
    }
    
    return NextResponse.json(
      { error: 'AI 커리큘럼 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 모의 커리큘럼 생성 함수 (OpenAI API 키가 없을 때 사용)
function generateMockCurriculum(topic: string, duration: number, level: string) {
  const weeks = Math.ceil(duration / 7)
  const sessions = []
  
  const topics = {
    'AI 기초': [
      '인공지능 개요와 역사',
      '머신러닝 기초 개념',
      '딥러닝 입문',
      '신경망의 이해',
      '컴퓨터 비전 기초',
      '자연어 처리 입문',
      'AI 윤리와 미래',
      '실전 프로젝트'
    ],
    '웹 개발': [
      'HTML/CSS 기초',
      'JavaScript 핵심',
      'React 입문',
      '상태 관리',
      'API 통신',
      '데이터베이스 기초',
      '배포와 운영',
      '실전 프로젝트'
    ],
    '데이터 분석': [
      'Python 기초',
      '데이터 구조와 판다스',
      '데이터 시각화',
      '통계 기초',
      '머신러닝 입문',
      '실전 데이터 분석',
      '프로젝트 발표',
      'Q&A 및 네트워킹'
    ]
  }

  const defaultTopics = [
    '입문 및 오리엔테이션',
    '기초 개념 학습',
    '핵심 이론 탐구',
    '실습 및 응용',
    '심화 학습',
    '프로젝트 준비',
    '프로젝트 구현',
    '발표 및 피드백'
  ]

  const selectedTopics = Object.keys(topics).find(key => 
    topic.toLowerCase().includes(key.toLowerCase())
  ) ? topics[Object.keys(topics).find(key => 
    topic.toLowerCase().includes(key.toLowerCase())
  )!] : defaultTopics

  for (let i = 0; i < Math.min(weeks, 8); i++) {
    sessions.push({
      week: i + 1,
      title: selectedTopics[i] || `주차 ${i + 1} 세션`,
      description: `${selectedTopics[i]}에 대한 심도있는 학습과 실습을 진행합니다.`,
      objectives: [
        `${selectedTopics[i]}의 핵심 개념 이해`,
        '실습을 통한 실무 능력 향상',
        '질의응답을 통한 심화 학습'
      ],
      materials: [
        '강의 슬라이드',
        '실습 자료',
        '참고 문헌'
      ],
      assignment: i < weeks - 1 ? `${selectedTopics[i]} 관련 과제` : '최종 프로젝트'
    })
  }

  return {
    overview: `${topic}에 대한 ${weeks}주 과정으로 구성된 체계적인 커리큘럼입니다.`,
    objectives: [
      `${topic}의 핵심 개념과 이론 습득`,
      '실습을 통한 실무 능력 배양',
      '프로젝트를 통한 포트폴리오 구축',
      '전문가 네트워크 형성'
    ],
    targetAudience: level === 'beginner' ? '입문자' : level === 'intermediate' ? '중급자' : '고급자',
    sessions,
    requirements: level === 'beginner' 
      ? ['학습 의지', '노트북 지참', '기초 컴퓨터 활용 능력']
      : ['프로그래밍 기초 지식', '관련 분야 기초 이해', '프로젝트 경험'],
    evaluation: {
      attendance: 30,
      assignments: 30,
      project: 30,
      participation: 10
    }
  }
}