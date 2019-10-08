require 'json'

json = File.read('datamatch-meet23-export.json')
datamatch_export = JSON.parse(json)

dorms = ["Greenough", "Hurlbut", "Pennypacker", "Wigglesworth", "Grays",
  "Matthews", "Weld", "Apley Court", "Hollis", "Holworthy", "Lionel", "Mass Hall",
  "Mower", "Stoughton", "Straus", "Canaday", "Thayer"].sort!

indexByName = dorms.map.with_index {|x, i| [x, i]}.to_h
nameByIndex = dorms.map.with_index {|x, i| [i, x]}.to_h

match_hash = {}
match_edge_array = Array.new(dorms.size)

dorms.each do |d1|
  match_hash[d1] = {}
  dorms.each do |d2|
    match_hash[d1][d2] = 0
  end
end
# We want key = dorm1,
# value = new hash of key = dorm2, value = number of matches

# get dorm info from matches and users
datamatch_export["matches"].each do |m|
  #puts m.inspect
  m = m[1]

  user1 = m["user1"]
  user2 = m["user2"]

  user1_obj = datamatch_export["users"][user1]
  user2_obj = datamatch_export["users"][user2]

  if user1_obj and user2_obj

    #puts "USER1: " + user1_obj.inspect
    #puts "USER2: " + user2_obj.inspect

    dorm1 = user1_obj["dorm"]
    dorm2 = user2_obj["dorm"]

    if dorms.include? dorm1 and dorms.include? dorm2
      match_hash[dorm1][dorm2] += 1
    end
  end
end

dorms.size.times do |i|
  match_edge_array[i] = Array.new(dorms.size, 0)
end

# merge the match_hash - need to do an array with edges
match_hash.each do |d1, v|
  d1_index = indexByName[d1]
  p d1_index

  v.each do |d2, val|
    d2_index = indexByName[d2]
    p d2_index
    match_edge_array[d1_index][d2_index] += val
  end
end

dorm_match_hash = {
  "match_edge_array" => match_edge_array,
  "indexByName" => indexByName,
  "nameByIndex" => nameByIndex
}

File.open("match_data.json", "w") do |f|
  f.write(dorm_match_hash.to_json)
end

