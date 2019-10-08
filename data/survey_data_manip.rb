require 'json'

$dorms = ["Greenough", "Hurlbut", "Pennypacker", "Wigglesworth", "Grays",
  "Matthews", "Weld", "Apley Court", "Hollis", "Holworthy", "Lionel", "Mass Hall",
  "Mower", "Stoughton", "Straus", "Canaday", "Thayer"].sort!

class Question
  attr_accessor :index, :id, :order, :text, :answer_hash

  def initialize(i, id, order, text)
    @index = i
    @id = id
    @order = order
    @text = text
    @answer_hash = {}
  end

  def to_json(options = {})
    return {'index' => @index, 'id' => @id, 'order' => @order, 'text' => @text,
      'answers' => @answer_hash.values }.to_json
  end


end

class Answer
  attr_accessor :index, :id, :text, :order, :response_hash
  def initialize(i, id, text, order)
    @index = i
    @id = id
    @text = text
    @order = order
    @response_hash = {"total" => 0}
    $dorms.each do |d|
      @response_hash[d] = 0
    end
  end

  def to_json(options = {})
    return {'index' => @index, 'id' => @id, 'text' => @text, 'order' => @order,
      'response_hash' => @response_hash }.to_json

  end
end

json = File.read('datamatch-meet23-export.json')
datamatch_export = JSON.parse(json)

questions = []

datamatch_export["surveys"]["-Lni_Q6OSArahbpgz6zU"]["questions"].each_with_index do |o, i|
  question = Question.new(i, o[0], o[1]["order"], o[1]["text"])
  o[1]["answers"].each_with_index do |ans, j|
    answer = Answer.new(j, ans[0], ans[1]["text"], ans[1]["order"])
    question.answer_hash[j.to_s] = answer
  end

  questions << question
end

datamatch_export["responses"]["-Lni_Q6OSArahbpgz6zU"].each do |response|
  if response[1].size == questions.size
    # get user corresponding to response
    user_obj = datamatch_export["users"][response[0]]

    response[1].each_with_index do |ans, i|
      if ans and user_obj and ($dorms.include? user_obj["dorm"])
        question = questions[i]
        answer = question.answer_hash[ans.to_s]
        answer.response_hash["total"] += 1
        answer.response_hash[user_obj["dorm"]] += 1
      end
    end
  end
end

File.open("survey_data.json", "w") do |f|
  f.write(questions.to_json)
end
# { question_index:
    # question_id:
    # total:
    #   answers: [100, 200, 300, 400, 500]
    # apley:
    #   answers:
    # ...
    # }
