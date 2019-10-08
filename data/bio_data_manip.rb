require 'json'

stop_words = ["", "also", "i", "im", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]

json = File.read('datamatch-meet23-export.json')
datamatch_export = JSON.parse(json)

descriptions = []


datamatch_export["users"].each do |user|
  if user[1]["description"] and !user[1]["description"].empty?
    descriptions << user[1]["description"].strip
  end
end

#puts descriptions.inspect

word_hash = {}

descriptions.each do |desc|
  words = desc.split
  words.each do |w|
    w = w.downcase.gsub(/\W/,  '')
    if not (stop_words.include? w)
      if word_hash.has_key? w
        word_hash[w] += 1
      else
        word_hash[w] = 1
      end
    end
  end
end

full_word_hash = word_hash.sort_by{|k,v| v}.reverse
truncated_word_hash = full_word_hash.select {|k, v| v > 3 }

word_array = []

truncated_word_hash.each do |k, v|
    word_array << {"word" => k, "occurrences" => v}
end

File.open("bio_data.json", "w") do |f|
  f.write(word_array.to_json)
end
